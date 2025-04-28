import { NextRequest, NextResponse } from "next/server";
import { generateCryptoAdviceStream } from "@/lib/openai";
import { getCryptoMarketData } from "@/lib/crypto-market";

/**
 * POST /api/copilot/audio
 * Process audio-based user messages and generate AI responses for the Copilot feature
 */
export async function POST(request: NextRequest) {
  try {
    // Get the form data
    const formData = await request.formData();
    const audio = formData.get("audio") as File;
    const model = formData.get("model") as string || "gpt-4.1-mini";

    if (!audio) {
      return NextResponse.json(
        { error: "No audio provided" },
        { status: 400 }
      );
    }

    // For now, we'll use a placeholder implementation
    // In a real implementation, we would:
    // 1. Convert the audio to a format OpenAI can process
    // 2. Use OpenAI's Whisper API to transcribe the audio
    // 3. Use the transcription as the input to the copilot

    // Fetch current crypto market data
    const marketData = await getCryptoMarketData(50);

    // Generate streaming response using OpenAI with the specified model
    // Here we're using a placeholder message
    const stream = await generateCryptoAdviceStream(
      "I received your audio message. In the future, I'll be able to transcribe and analyze it. For now, here's some general crypto advice.",
      marketData,
      model
    );

    // Return the stream directly
    return new Response(stream);
  } catch (error: any) {
    console.error("Error in POST /api/copilot/audio:", error);
    return NextResponse.json(
      {
        error: "Failed to process audio",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
