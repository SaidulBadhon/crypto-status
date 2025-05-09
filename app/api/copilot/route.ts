import { NextRequest, NextResponse } from "next/server";
import { generateCryptoAdvice, generateCryptoAdviceStream } from "@/lib/openai";
import { getCryptoMarketData } from "@/lib/crypto-market";

/**
 * POST /api/copilot
 * Process user messages and generate AI responses for the Copilot feature
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const data = await request.json();
    const { message, stream = false } = data;

    if (!message) {
      return NextResponse.json(
        { error: "No message provided" },
        { status: 400 }
      );
    }

    // Fetch current crypto market data
    const marketData = await getCryptoMarketData(50);

    // Check if streaming is requested
    if (stream) {
      // Generate streaming response using OpenAI
      const stream = await generateCryptoAdviceStream(message, marketData);

      // Return the stream directly
      return new Response(stream);
    } else {
      // Generate regular response using OpenAI
      const response = await generateCryptoAdvice(message, marketData);

      return NextResponse.json({
        success: true,
        response,
      });
    }
  } catch (error: any) {
    console.error("Error in POST /api/copilot:", error);
    return NextResponse.json(
      {
        error: "Failed to process message",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
