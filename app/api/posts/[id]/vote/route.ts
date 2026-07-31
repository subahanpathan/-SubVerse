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

    const postId = params.id;
    const body = await req.json();
    const { voteType } = VoteSchema.parse(body);

    const voteValue = voteType === "UP" ? 1 : -1;

    // Check if post exists
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Check existing vote
    const existingVote = await db.vote.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId,
        },
      },
    });

    let karmaChange = 0;

    if (existingVote) {
      if (existingVote.value === voteValue) {
        // Toggle off vote (remove vote)
        await db.vote.delete({
          where: { id: existingVote.id },
        });
        karmaChange = -voteValue;
      } else {
        // Change vote (e.g. from -1 to +1 -> delta is +2)
        await db.vote.update({
          where: { id: existingVote.id },
          data: { value: voteValue },
        });
        karmaChange = voteValue * 2;
      }
    } else {
      // Create new vote
      await db.vote.create({
        data: {
          userId: session.user.id,
          postId: postId,
          value: voteValue,
        },
      });
      karmaChange = voteValue;
    }

    // Update author karma
    if (karmaChange !== 0 && post.authorId) {
      await db.user.update({
        where: { id: post.authorId },
        data: { karma: { increment: karmaChange } },
      });
    }

    // Return new aggregate vote score
    const aggregateVotes = await db.vote.findMany({
      where: { postId: postId },
      select: { value: true },
    });

    const newVoteScore = aggregateVotes.reduce(
      (acc, vote) => acc + vote.value,
      0
    );

    return NextResponse.json({
      voteScore: newVoteScore,
      currentVote: existingVote && existingVote.value === voteValue ? 0 : voteValue,
    });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return NextResponse.json({ message: "Invalid vote payload" }, { status: 422 });
    }
    return NextResponse.json(
      { message: "Could not register vote" },
      { status: 500 }
    );
  }
}
