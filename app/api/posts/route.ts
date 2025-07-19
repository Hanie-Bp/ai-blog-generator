import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// GET /api/posts - Get all published posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url, "http://localhost");
    const sort = searchParams.get("sort") || "latest";
    let orderBy: Prisma.PostOrderByWithRelationInput | undefined;
    if (sort === "earliest") {
      orderBy = { publishedAt: "asc" };
    } else if (sort === "latest") {
      orderBy = { publishedAt: "desc" };
    }
    if (sort === "highest-rated") {
      // Get posts with their average rating
      const posts = await prisma.post.findMany({
        where: { published: true },
        include: {
          author: { select: { name: true, email: true } },
          ratings: true,
        },
      });
      // Calculate average rating for each post
      const postsWithAvg = posts.map((post) => ({
        ...post,
        averageRating: post.ratings.length
          ? post.ratings.reduce((sum, r) => sum + r.value, 0) /
            post.ratings.length
          : 0,
      }));
      // Sort by averageRating desc
      postsWithAvg.sort((a, b) => b.averageRating - a.averageRating);
      // Remove ratings from response for cleanliness
      const postsClean = postsWithAvg.map(({ ratings, ...rest }) => rest);
      return NextResponse.json(postsClean);
    } else {
      // latest or earliest
      const posts = await prisma.post.findMany({
        where: { published: true },
        include: {
          author: { select: { name: true, email: true } },
        },
        orderBy,
      });
      return NextResponse.json(posts);
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { title, content, summary, slug, published } = body;
    if (!title || !content || !slug) {
      return NextResponse.json(
        { error: "Title, content, and slug are required" },
        { status: 400 }
      );
    }
    const post = await prisma.post.create({
      data: {
        title,
        content,
        summary,
        slug,
        published: !!published,
        publishedAt: published ? new Date() : null,
        authorId: token.sub,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

// DELETE /api/posts?id=... - Delete a post by id
export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url, "http://localhost");
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }
    await prisma.post.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
