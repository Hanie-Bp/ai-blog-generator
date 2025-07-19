import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

// POST /api/posts/rate - Set or update a user's rating for a post
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { postId, value } = await request.json();
    if (!postId || !value || value < 1 || value > 5) {
      return NextResponse.json(
        { error: "Invalid rating data" },
        { status: 400 }
      );
    }
    const rating = await prisma.rating.upsert({
      where: { userId_postId: { userId: token.sub, postId } },
      update: { value },
      create: { userId: token.sub, postId, value },
    });
    return NextResponse.json(rating);
  } catch (error) {
    console.error("Error rating post:", error);
    return NextResponse.json({ error: "Failed to rate post" }, { status: 500 });
  }
}
