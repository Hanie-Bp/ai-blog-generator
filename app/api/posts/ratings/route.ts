import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

// This handler relies on request data, so prevent static optimization
export const dynamic = "force-dynamic";

// GET /api/posts/ratings?postId=... - Get ratings for a post
export async function GET(request: NextRequest) {
  try {
    const postId = request.nextUrl.searchParams.get("postId");
    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }
    const ratings = await prisma.rating.findMany({ where: { postId } });
    const avg = ratings.length
      ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
      : 0;
    let userRating = null;
    const token = await getToken({ req: request });
    if (token && token.sub) {
      const user = ratings.find((r) => r.userId === token.sub);
      userRating = user ? user.value : null;
    }
    return NextResponse.json({
      average: avg,
      count: ratings.length,
      userRating,
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}
