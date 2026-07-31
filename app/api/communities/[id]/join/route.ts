import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const communityId = params.id;

    // Check if community exists
    const community = await db.community.findFirst({
      where: {
        OR: [{ id: communityId }, { name: communityId.toLowerCase() }],
      },
    });

    if (!community) {
      return NextResponse.json(
        { message: "Community not found" },
        { status: 404 }
      );
    }

    // Check existing membership
    const existingMembership = await db.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: session.user.id,
          communityId: community.id,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { message: "Already a member of this community" },
        { status: 400 }
      );
    }

    // Join community
    await db.communityMember.create({
      data: {
        userId: session.user.id,
        communityId: community.id,
      },
    });

    return NextResponse.json(
      { message: "Successfully joined community" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Could not join community" },
      { status: 500 }
    );
  }
}
