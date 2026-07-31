import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { sanitizeText } from "@/lib/utils";
import { CreatePostSchema } from "@/lib/validators/post";
import { NextResponse } from "next/server";

// GET /api/posts - Feed
export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    const { searchParams } = new URL(req.url);

    const communityName = searchParams.get("communityName");
    const sort = searchParams.get("sort") || "new"; // "new" | "top"
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    let whereClause: any = {};

    if (communityName) {
      whereClause.community = {
        name: communityName.toLowerCase(),
      };
    }

    const posts = await db.post.findMany({
      where: whereClause,
      include: {
        author: {
          select: { id: true, name: true, image: true, karma: true },
        },
        community: {
          select: { id: true, name: true },
        },
        votes: true,
        _count: {
          select: { comments: true },
        },
      },
      orderBy:
        sort === "top"
          ? { votes: { _count: "desc" } }
          : { createdAt: "desc" },
      take: limit,
      skip: skip,
    });

    // Format post data with vote calculation
    const formattedPosts = posts.map((post) => {
      const voteScore = post.votes.reduce((acc, vote) => acc + vote.value, 0);
      const userVote = session?.user?.id
        ? post.votes.find((v) => v.userId === session.user.id)?.value || 0
        : 0;

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        imageUrl: post.imageUrl,
        linkUrl: post.linkUrl,
        createdAt: post.createdAt,
        author: post.author,
        community: post.community,
        voteScore,
        currentVote: userVote,
        commentCount: post._count.comments,
      };
    });

    return NextResponse.json(formattedPosts);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create post
export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, imageUrl, linkUrl, communityId } =
      CreatePostSchema.parse(body);

    // Verify community exists or find by name
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

    // Create post and auto-add initial upvote from author
    const post = await db.post.create({
      data: {
        title: sanitizeText(title),
        content: content ? sanitizeText(content) : null,
        imageUrl: imageUrl || null,
        linkUrl: linkUrl || null,
        authorId: session.user.id,
        communityId: community.id,
        votes: {
          create: {
            userId: session.user.id,
            value: 1,
          },
        },
      },
    });

    // Update author karma +1 for post creation upvote
    await db.user.update({
      where: { id: session.user.id },
      data: { karma: { increment: 1 } },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { message: error.errors[0]?.message || "Invalid payload" },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { message: "Failed to create post" },
      { status: 500 }
    );
  }
}
