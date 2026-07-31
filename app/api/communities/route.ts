import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { sanitizeText } from "@/lib/utils";
import { CreateCommunitySchema } from "@/lib/validators/community";
import { NextResponse } from "next/server";

// GET /api/communities - List communities
export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // "joined" | "all"

    let communities;

    if (filter === "joined" && session?.user?.id) {
      communities = await db.community.findMany({
        where: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
        include: {
          _count: {
            select: { members: true, posts: true },
          },
        },
        orderBy: { name: "asc" },
      });
    } else {
      communities = await db.community.findMany({
        include: {
          _count: {
            select: { members: true, posts: true },
          },
        },
        orderBy: { members: { _count: "desc" } },
        take: 20,
      });
    }

    // Attach `isJoined` flag if user logged in
    const formatted = communities.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      memberCount: c._count.members,
      postCount: c._count.posts,
      createdAt: c.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch communities" },
      { status: 500 }
    );
  }
}

// POST /api/communities - Create community
export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description } = CreateCommunitySchema.parse(body);

    const normalizedName = name.toLowerCase().trim();

    // Check if community exists
    const existingCommunity = await db.community.findUnique({
      where: { name: normalizedName },
    });

    if (existingCommunity) {
      return NextResponse.json(
        { message: `Subverse r/${normalizedName} already exists` },
        { status: 409 }
      );
    }

    // Create community & auto-join the creator as first member
    const community = await db.community.create({
      data: {
        name: normalizedName,
        description: sanitizeText(description),
        creatorId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
          },
        },
      },
    });

    return NextResponse.json(community, { status: 201 });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { message: error.errors[0]?.message || "Invalid input data" },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { message: "Could not create community" },
      { status: 500 }
    );
  }
}
