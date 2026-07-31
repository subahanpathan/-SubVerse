import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { VoteSchema } from "@/lib/validators/post";
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

    const commentId = params.id;
    const body = await req.json();
    const { voteType } = VoteSchema.parse(body);

    const voteValue = voteType === "UP" ? 1 : -1;

    // Check comment exists
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      select: { id: true, authorId: true },
    });

    if (!comment) {
      return NextResponse.json(
        { message: "Comment not found" },
        { status: 404 }
      );
    }

    // Check existing vote
    const existingVote = await db.vote.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId: commentId,
        },
      },
    });

    let karmaChange = 0;

    if (existingVote) {
      if (existingVote.value === voteValue) {
        // Remove vote
        await db.vote.delete({
          where: { id: existingVote.id },
        });
        karmaChange = -voteValue;
      } else {
        // Update vote direction
        await db.vote.update({
          where: { id: existingVote.id },
          data: { value: voteValue },
        });
        karmaChange = voteValue * 2;
      }
    } else {
      // New vote
      await db.vote.create({
        data: {
          userId: session.user.id,
          commentId: commentId,
          value: voteValue,
        },
      });
      karmaChange = voteValue;
    }

    // Update comment author karma
    if (karmaChange !== 0 && comment.authorId) {
      await db.user.update({
        where: { id: comment.authorId },
        data: { karma: { increment: karmaChange } },
      });
    }

    // Aggregate comment votes
    const aggregateVotes = await db.vote.findMany({
      where: { commentId: commentId },
      select: { value: true },
    });

    const newVoteScore = aggregateVotes.reduce(
      (acc, vote) => acc + vote.value,
      0
    );

    return NextResponse.json({
      voteScore: newVoteScore,
      currentVote:
        existingVote && existingVote.value === voteValue ? 0 : voteValue,
    });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { message: "Invalid vote payload" },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { message: "Could not register comment vote" },
      { status: 500 }
    );
  }
}
