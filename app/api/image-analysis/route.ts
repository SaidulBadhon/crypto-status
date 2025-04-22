import { NextRequest, NextResponse } from "next/server";
import { analyzeMultipleImagesWithOpenAI } from "@/lib/openai";

/**
 * POST /api/image-analysis
 * Analyze images and extract portfolio data
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const formData = await request.formData();
    const images = formData.getAll("images") as File[];

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    // Convert images to base64
    const imagesBase64: string[] = await Promise.all(
      images.map(async (image) => {
        const buffer = await image.arrayBuffer();
        return Buffer.from(buffer).toString("base64");
      })
    );

    // Analyze images with OpenAI
    // Always use the multiple images function, which now handles both single and multiple images
    // and analyzes all images together in a single API call when multiple images are provided
    const portfolioItems = await analyzeMultipleImagesWithOpenAI(imagesBase64);

    return NextResponse.json({
      success: true,
      portfolioItems,
    });
  } catch (error: any) {
    console.error("Error in POST /api/image-analysis:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze images",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
