import { PortfolioItem, CryptoItem } from "@/types";

/**
 * Analyzes an image using OpenAI's Vision API to extract crypto portfolio data
 * 
 * @param imageBase64 Base64 encoded image data
 * @returns Extracted portfolio data
 */
export async function analyzeImageWithOpenAI(imageBase64: string): Promise<PortfolioItem> {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    // Prepare the API request to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: "You are a specialized assistant that extracts cryptocurrency portfolio data from images. Extract all cryptocurrency names, amounts, prices, and values in USDT. Format the response as a valid JSON object."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract the cryptocurrency portfolio data from this image. Return ONLY a valid JSON object with the following structure: { \"createdAt\": \"ISO date string\", \"total\": \"$X,XXX.XX\", \"crypto\": [ { \"name\": \"SYMBOL\", \"amount\": \"X.XX\", \"amountInUsdt\": \"X,XXX\", \"parPrice\": \"$X,XXX\" }, ... ] }"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    // Extract JSON from the response
    // The response might contain markdown or other text, so we need to extract just the JSON part
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/) || content.match(/{[\s\S]*?}/);
    
    let portfolioData: PortfolioItem;
    
    if (jsonMatch) {
      try {
        // Try to parse the extracted JSON
        portfolioData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (e) {
        // If parsing fails, try to parse the entire content
        portfolioData = JSON.parse(content);
      }
    } else {
      // If no JSON-like content is found, try to parse the entire content
      portfolioData = JSON.parse(content);
    }

    // Validate the portfolio data
    if (!portfolioData.createdAt) {
      portfolioData.createdAt = new Date().toISOString();
    }

    if (!portfolioData.total) {
      // Calculate total from crypto items if not provided
      const total = portfolioData.crypto.reduce((sum: number, crypto: CryptoItem) => {
        const amountInUsdt = parseFloat(crypto.amountInUsdt.replace(/,/g, ''));
        return sum + (isNaN(amountInUsdt) ? 0 : amountInUsdt);
      }, 0);
      
      portfolioData.total = `$${total.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }

    return portfolioData;
  } catch (error) {
    console.error("Error analyzing image with OpenAI:", error);
    throw error;
  }
}

/**
 * Analyzes multiple images using OpenAI's Vision API
 * 
 * @param imagesBase64 Array of base64 encoded image data
 * @returns Array of extracted portfolio items
 */
export async function analyzeMultipleImagesWithOpenAI(imagesBase64: string[]): Promise<PortfolioItem[]> {
  try {
    const promises = imagesBase64.map(imageBase64 => analyzeImageWithOpenAI(imageBase64));
    return Promise.all(promises);
  } catch (error) {
    console.error("Error analyzing multiple images with OpenAI:", error);
    throw error;
  }
}
