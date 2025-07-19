import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// GET /api/drafts - Get user's drafts or a single draft by id
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const sort = searchParams.get("sort") || "latest";
    if (id) {
      // Fetch a single draft by id
      const draft = await prisma.draft.findFirst({
        where: { id, authorId: token.sub },
      });
      if (!draft) {
        return NextResponse.json({ error: "Draft not found" }, { status: 404 });
      }
      return NextResponse.json(draft);
    }
    let orderBy: Prisma.DraftOrderByWithRelationInput | undefined;
    if (sort === "earliest") {
      orderBy = { updatedAt: "asc" };
    } else if (sort === "latest") {
      orderBy = { updatedAt: "desc" };
    }
    if (sort === "highest-rated") {
      // If ratings for drafts exist, implement aggregation here. Otherwise, fallback to latest.
      // For now, fallback to latest as drafts are not rated.
      orderBy = { updatedAt: "desc" };
    }
    const drafts = await prisma.draft.findMany({
      where: { authorId: token.sub },
      orderBy,
    });
    return NextResponse.json(drafts);
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return NextResponse.json(
      { error: "Failed to fetch drafts" },
      { status: 500 }
    );
  }
}

// POST /api/drafts - Create or update a draft
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { id, title, content, topic, tone, length } = body;
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }
    let draft;
    if (id) {
      // Update existing draft
      draft = await prisma.draft.update({
        where: { id, authorId: token.sub },
        data: { title, content, topic, tone, length },
      });
    } else {
      // Create new draft
      draft = await prisma.draft.create({
        data: { title, content, topic, tone, length, authorId: token.sub },
      });
    }
    return NextResponse.json(draft);
  } catch (error) {
    console.error("Error saving draft:", error);
    return NextResponse.json(
      { error: "Failed to save draft" },
      { status: 500 }
    );
  }
}

// DELETE /api/drafts - Delete a draft
export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Draft ID is required" },
        { status: 400 }
      );
    }
    await prisma.draft.delete({
      where: {
        id,
        authorId: token.sub, // Ensure user owns the draft
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting draft:", error);
    return NextResponse.json(
      { error: "Failed to delete draft" },
      { status: 500 }
    );
  }
}
