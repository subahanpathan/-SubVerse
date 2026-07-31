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

    // Delete membership
    await db.communityMember.deleteMany({
      where: {
        userId: session.user.id,
        communityId: community.id,
      },
    });

    return NextResponse.json(
      { message: "Successfully left community" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Could not leave community" },
      { status: 500 }
    );
  }
}
