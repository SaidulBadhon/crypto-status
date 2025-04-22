import { NextRequest, NextResponse } from "next/server";
import { analyzeImageWithOpenAI, analyzeMultipleImagesWithOpenAI } from "@/lib/openai";
import { PortfolioItem } from "@/types";

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
    let portfolioItems: PortfolioItem[];
    
    if (imagesBase64.length === 1) {
      // If only one image, analyze it directly
      const portfolioItem = await analyzeImageWithOpenAI(imagesBase64[0]);
      portfolioItems = [portfolioItem];
    } else {
      // If multiple images, analyze them in parallel
      portfolioItems = await analyzeMultipleImagesWithOpenAI(imagesBase64);
    }

    return NextResponse.json({
      success: true,
      portfolioItems,
    });
  } catch (error: any) {
    console.error("Error in POST /api/image-analysis:", error);
    return NextResponse.json(
      { 
        error: "Failed to analyze images",
        message: error.message 
      },
      { status: 500 }
    );
  }
}
