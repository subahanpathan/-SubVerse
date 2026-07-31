import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    const postId = params.id;

    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: { id: true, name: true, image: true, karma: true },
        },
        community: {
          select: { id: true, name: true, description: true },
        },
        votes: true,
        _count: {
          select: { comments: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const voteScore = post.votes.reduce((acc, vote) => acc + vote.value, 0);
    const currentVote = session?.user?.id
      ? post.votes.find((v) => v.userId === session.user.id)?.value || 0
      : 0;

    return NextResponse.json({
      id: post.id,
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl,
      linkUrl: post.linkUrl,
      createdAt: post.createdAt,
      author: post.author,
      community: post.community,
      voteScore,
      currentVote,
      commentCount: post._count.comments,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const postId = params.id;

    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { message: "You can only delete your own posts" },
        { status: 403 }
      );
    }

    await db.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete post" },
      { status: 500 }
    );
  }
}
