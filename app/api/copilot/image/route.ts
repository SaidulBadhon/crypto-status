import { NextRequest, NextResponse } from "next/server";
import { generateCryptoAdviceStream } from "@/lib/openai";
import { getCryptoMarketData } from "@/lib/crypto-market";

/**
 * POST /api/copilot/image
 * Process image-based user messages and generate AI responses for the Copilot feature
 */
export async function POST(request: NextRequest) {
  try {
    // Get the form data
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const model = formData.get("model") as string || "gpt-4.1-mini";

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Convert image to base64
    const buffer = await image.arrayBuffer();
    const imageBase64 = Buffer.from(buffer).toString("base64");

    // Fetch current crypto market data
    const marketData = await getCryptoMarketData(50);

    // Generate streaming response using OpenAI with the specified model
    const stream = await generateCryptoAdviceStream(
      "Analyze this image related to cryptocurrency and provide insights",
      marketData,
      model,
      `data:image/jpeg;base64,${imageBase64}`
    );

    // Return the stream directly
    return new Response(stream);
  } catch (error: any) {
    console.error("Error in POST /api/copilot/image:", error);
    return NextResponse.json(
      {
        error: "Failed to process image",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
