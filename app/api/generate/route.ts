import { NextRequest, NextResponse } from "next/server";
import { generateBlogContent, BlogGenerationRequest } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const body: BlogGenerationRequest = await request.json();

    // Validate required fields
    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { error: "Blog title is required" },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    // Generate blog content
    const result = await generateBlogContent(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in generate API route:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
