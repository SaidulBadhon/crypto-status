import { NextRequest, NextResponse } from "next/server";
import { generateImageWithDallE } from "@/lib/openai";

/**
 * POST /api/copilot/generate-image
 * Generate an image based on a text prompt using DALL-E
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const data = await request.json();
    const { prompt, size = "1024x1024" } = data;

    if (!prompt) {
      return NextResponse.json(
        { error: "No prompt provided" },
        { status: 400 }
      );
    }

    // Generate image with DALL-E
    const imageUrl = await generateImageWithDallE(prompt, size);

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error: any) {
    console.error("Error in POST /api/copilot/generate-image:", error);
    return NextResponse.json(
      {
        error: "Failed to generate image",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
