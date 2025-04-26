import { NextRequest, NextResponse } from "next/server";
import { analyzeTransactionImageWithOpenAI } from "@/lib/openai";

/**
 * POST /api/transaction-image-analysis
 * Analyze an image and extract transaction data
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Convert image to base64
    const buffer = await image.arrayBuffer();
    const imageBase64 = Buffer.from(buffer).toString("base64");

    // Analyze image with OpenAI
    const transaction = await analyzeTransactionImageWithOpenAI(imageBase64);

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error: any) {
    console.error("Error in POST /api/transaction-image-analysis:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze image",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
