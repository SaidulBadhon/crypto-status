import { NextRequest, NextResponse } from "next/server";
import {
  generateCryptoAdvice,
  generateCryptoAdviceStream,
  generateImageWithDallE,
} from "@/lib/openai";
import { getCryptoMarketData } from "@/lib/crypto-market";

/**
 * Detects if a message is requesting image generation
 * @param message The user's message
 * @returns True if the message appears to be requesting image generation
 */
function detectImageGenerationRequest(message: string): boolean {
  const message_lower = message.toLowerCase();

  // Common phrases that indicate image generation requests
  const imageGenerationPhrases = [
    "generate an image",
    "create an image",
    "make an image",
    "draw",
    "create a picture",
    "generate a picture",
    "create a visual",
    "generate a visual",
    "create an illustration",
    "generate an illustration",
    "create a diagram",
    "generate a diagram",
    "create a chart",
    "generate a chart",
    "create a graph",
    "generate a graph",
    "create a visualization",
    "generate a visualization",
    "show me an image",
    "show me a picture",
    "can you create an image",
    "can you generate an image",
    "can you make an image",
    "can you draw",
    "could you create an image",
    "could you generate an image",
    "could you make an image",
    "could you draw",
    "i want an image",
    "i want a picture",
    "i need an image",
    "i need a picture",
    "visualize",
    "visualise",
    "image of",
    "picture of",
    "dall-e",
    "dalle",
  ];

  // Check if any of the phrases are in the message
  return imageGenerationPhrases.some((phrase) =>
    message_lower.includes(phrase)
  );
}

/**
 * Extracts the image prompt from a message
 * @param message The user's message
 * @returns The extracted image prompt
 */
function extractImagePrompt(message: string): string {
  const message_lower = message.toLowerCase();

  // Common prefixes to remove
  const prefixesToRemove = [
    "generate an image of ",
    "generate an image with ",
    "generate an image showing ",
    "generate an image that shows ",
    "generate an image about ",
    "create an image of ",
    "create an image with ",
    "create an image showing ",
    "create an image that shows ",
    "create an image about ",
    "make an image of ",
    "make an image with ",
    "make an image showing ",
    "make an image that shows ",
    "make an image about ",
    "draw ",
    "can you generate an image of ",
    "can you generate an image with ",
    "can you generate an image showing ",
    "can you generate an image that shows ",
    "can you generate an image about ",
    "can you create an image of ",
    "can you create an image with ",
    "can you create an image showing ",
    "can you create an image that shows ",
    "can you create an image about ",
    "can you make an image of ",
    "can you make an image with ",
    "can you make an image showing ",
    "can you make an image that shows ",
    "can you make an image about ",
    "can you draw ",
    "could you generate an image of ",
    "could you generate an image with ",
    "could you generate an image showing ",
    "could you generate an image that shows ",
    "could you generate an image about ",
    "could you create an image of ",
    "could you create an image with ",
    "could you create an image showing ",
    "could you create an image that shows ",
    "could you create an image about ",
    "could you make an image of ",
    "could you make an image with ",
    "could you make an image showing ",
    "could you make an image that shows ",
    "could you make an image about ",
    "could you draw ",
    "i want an image of ",
    "i want an image with ",
    "i want an image showing ",
    "i want an image that shows ",
    "i want an image about ",
    "i need an image of ",
    "i need an image with ",
    "i need an image showing ",
    "i need an image that shows ",
    "i need an image about ",
    "visualize ",
    "visualise ",
  ];

  // Try to find and remove a prefix
  for (const prefix of prefixesToRemove) {
    const index = message_lower.indexOf(prefix);
    if (index !== -1) {
      // Return the original message (with original casing) after the prefix
      return message.substring(index + prefix.length).trim();
    }
  }

  // If no specific prefix is found, use the whole message but remove generic phrases
  let prompt = message;
  const genericPhrases = [
    "generate an image",
    "create an image",
    "make an image",
    "draw",
    "using dall-e",
    "using dalle",
    "with dall-e",
    "with dalle",
  ];

  for (const phrase of genericPhrases) {
    prompt = prompt.replace(new RegExp(phrase, "gi"), "");
  }

  return prompt.trim();
}

/**
 * POST /api/copilot
 * Process user messages and generate AI responses for the Copilot feature
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const data = await request.json();
    const { message, stream = false, model = "gpt-4.1-mini" } = data;

    if (!message) {
      return NextResponse.json(
        { error: "No message provided" },
        { status: 400 }
      );
    }

    // Fetch current crypto market data
    const marketData = await getCryptoMarketData(50);

    // Check if this is an image generation request
    const isImageGenerationRequest = detectImageGenerationRequest(message);

    if (isImageGenerationRequest) {
      try {
        // Extract the image prompt from the message
        const imagePrompt = extractImagePrompt(message);

        // Generate the image
        const imageUrl = await generateImageWithDallE(imagePrompt);

        // Return a special response that includes both text and the image URL
        if (stream) {
          // For streaming, we'll return a special format that the client can parse
          const encoder = new TextEncoder();
          const imageResponse = {
            type: "generated-image",
            content: `I've generated an image based on your request: "${imagePrompt}"`,
            imageUrl: imageUrl,
          };

          return new Response(encoder.encode(JSON.stringify(imageResponse)));
        } else {
          return NextResponse.json({
            success: true,
            type: "generated-image",
            response: `I've generated an image based on your request: "${imagePrompt}"`,
            imageUrl: imageUrl,
          });
        }
      } catch (error) {
        console.error("Error generating image:", error);
        // If image generation fails, fall back to text response
      }
    }

    // Regular text processing
    if (stream) {
      // Generate streaming response using OpenAI with the specified model
      const stream = await generateCryptoAdviceStream(
        message,
        marketData,
        model
      );

      // Return the stream directly
      return new Response(stream);
    } else {
      // Generate regular response using OpenAI with the specified model
      const response = await generateCryptoAdvice(message, marketData, model);

      return NextResponse.json({
        success: true,
        type: "text",
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
