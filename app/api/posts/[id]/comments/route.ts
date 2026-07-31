import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { sanitizeText } from "@/lib/utils";
import { CreateCommentSchema } from "@/lib/validators/post";
import { NextResponse } from "next/server";

// GET /api/posts/[id]/comments
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    const postId = params.id;

    const comments = await db.comment.findMany({
      where: { postId: postId },
      include: {
        author: {
          select: { id: true, name: true, image: true, karma: true },
        },
        votes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedComments = comments.map((comment) => {
      const voteScore = comment.votes.reduce((acc, vote) => acc + vote.value, 0);
      const userVote = session?.user?.id
        ? comment.votes.find((v) => v.userId === session.user.id)?.value || 0
        : 0;

      return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: comment.author,
        parentId: comment.parentId,
        voteScore,
        currentVote: userVote,
      };
    });

    return NextResponse.json(formattedComments);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/posts/[id]/comments
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const postId = params.id;
    const body = await req.json();
    const { content, parentId } = CreateCommentSchema.parse({
      ...body,
      postId,
    });

    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Create comment and auto-add author initial upvote
    const comment = await db.comment.create({
      data: {
        content: sanitizeText(content),
        postId: postId,
        authorId: session.user.id,
        parentId: parentId || null,
        votes: {
          create: {
            userId: session.user.id,
            value: 1,
          },
        },
      },
      include: {
        author: {
          select: { id: true, name: true, image: true, karma: true },
        },
      },
    });

    // Update comment author karma +1
    await db.user.update({
      where: { id: session.user.id },
      data: { karma: { increment: 1 } },
    });

    return NextResponse.json(
      {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: comment.author,
        parentId: comment.parentId,
        voteScore: 1,
        currentVote: 1,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { message: error.errors[0]?.message || "Invalid payload" },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { message: "Could not post comment" },
      { status: 500 }
    );
  }
}
