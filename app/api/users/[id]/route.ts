import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    const identifier = params.id;

    // Search by ID or Name
    const user = await db.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { name: { equals: identifier } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        karma: true,
        createdAt: true,
        posts: {
          take: 20,
          orderBy: { createdAt: "desc" },
          include: {
            community: { select: { id: true, name: true } },
            votes: true,
            _count: { select: { comments: true } },
          },
        },
        comments: {
          take: 20,
          orderBy: { createdAt: "desc" },
          include: {
            post: {
              select: {
                id: true,
                title: true,
                community: { select: { name: true } },
              },
            },
            votes: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const formattedPosts = user.posts.map((post) => {
      const voteScore = post.votes.reduce((acc, v) => acc + v.value, 0);
      const currentVote = session?.user?.id
        ? post.votes.find((v) => v.userId === session.user.id)?.value || 0
        : 0;

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        imageUrl: post.imageUrl,
        linkUrl: post.linkUrl,
        createdAt: post.createdAt,
        community: post.community,
        voteScore,
        currentVote,
        commentCount: post._count.comments,
      };
    });

    const formattedComments = user.comments.map((comment) => {
      const voteScore = comment.votes.reduce((acc, v) => acc + v.value, 0);
      return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        post: comment.post,
        voteScore,
      };
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      image: user.image,
      karma: user.karma,
      createdAt: user.createdAt,
      posts: formattedPosts,
      comments: formattedComments,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
