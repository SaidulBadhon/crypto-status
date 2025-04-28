import {
  PortfolioItem,
  CryptoItem,
  Transaction,
  TransactionType,
} from "@/types";
import { CryptoMarketData } from "./crypto-market";

/**
 * Analyzes an image using OpenAI's Vision API to extract crypto portfolio data
 *
 * @param imageBase64 Base64 encoded image data
 * @returns Extracted portfolio data
 */
export async function analyzeImageWithOpenAI(
  imageBase64: string
): Promise<PortfolioItem> {
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
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            // "You are a specialized assistant that extracts cryptocurrency portfolio data from images. Extract all cryptocurrency names, amounts, prices, and values in USDT. Format the response as a valid JSON object.",
            content: `Please return current value, amount of crypto i have on each total and their value, make sure you get that data from the images, also created At date should be: ${new Date().toISOString()}

Give data in this format

{
  "total": "1,812.87 USDT",
  "crypto": [
    {
      "name": "BTC",
      "amount": "0.01144002",
      "amountInUsdt": "1000.85",
      "parPrice": "87,505.74 USDT"
    },
    {
      "name": "NEAR",
      "amount": "152.38779806",
      "amountInUsdt": "446.19",
      "parPrice": "2.929 USDT"
    },
    {
      "name": "ETH",
      "amount": "0.09609376",
      "amountInUsdt": "200.74",
      "parPrice": "2,089.64 USDT"
    },
    {
      "name": "USDT",
      "amount": "164.14881995",
      "amountInUsdt": "164.15",
      "parPrice": "1.0000 USDT"
    },
    {
      "name": "USDC",
      "amount": "0.66712586",
      "amountInUsdt": "0.66699243",
      "parPrice": "1.0000 USDT"
    },
    {
      "name": "BNB",
      "amount": "0.00015013",
      "amountInUsdt": "0.09442214",
      "parPrice": "629.02 USDT"
    },
    {
      "name": "HMSTR",
      "amount": "6.11",
      "amountInUsdt": "0.01256827",
      "parPrice": "0.002059 USDT"
    },
    {
      "name": "CGPT",
      "amount": "0.0500386",
      "amountInUsdt": "0.00522903",
      "parPrice": "0.1045 USDT"
    },
    {
      "name": "SHELL",
      "amount": "0.00146155",
      "amountInUsdt": "0.00041566",
      "parPrice": "0.2847 USDT"
    },
    {
      "name": "DOGS",
      "amount": "0.02",
      "amountInUsdt": "0.00000323",
      "parPrice": "0.001618 USDT"
    }
  ],
  "createdAt": "2025-03-24 12:27:14"
}`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: 'Extract the cryptocurrency portfolio data from this image. Return ONLY a valid JSON object with the following structure: { "createdAt": "ISO date string", "total": "$X,XXX.XX", "crypto": [ { "name": "SYMBOL", "amount": "X.XX", "amountInUsdt": "X,XXX", "parPrice": "$X,XXX" }, ... ] }',
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        // max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    // Extract JSON from the response
    // The response might contain markdown or other text, so we need to extract just the JSON part
    const jsonMatch =
      content.match(/```json\n([\s\S]*?)\n```/) ||
      content.match(/```([\s\S]*?)```/) ||
      content.match(/{[\s\S]*?}/);

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
      const total = portfolioData.crypto.reduce(
        (sum: number, crypto: CryptoItem) => {
          const amountInUsdt = parseFloat(
            crypto.amountInUsdt.replace(/,/g, "")
          );
          return sum + (isNaN(amountInUsdt) ? 0 : amountInUsdt);
        },
        0
      );

      portfolioData.total = `$${total.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    return portfolioData;
  } catch (error) {
    console.error("Error analyzing image with OpenAI:", error);
    throw error;
  }
}

/**
 * Analyzes multiple images together using OpenAI's Vision API in a single API call
 *
 * @param imagesBase64 Array of base64 encoded image data
 * @returns A single portfolio item combining data from all images
 */
export async function analyzeMultipleImagesWithOpenAI(
  imagesBase64: string[]
): Promise<PortfolioItem[]> {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    if (imagesBase64.length === 0) {
      throw new Error("No images provided for analysis");
    }

    // If only one image, use the single image analysis function
    if (imagesBase64.length === 1) {
      const result = await analyzeImageWithOpenAI(imagesBase64[0]);
      return [result];
    }

    // Prepare the image content array for the API request
    const imageContents = imagesBase64.map((imageBase64) => ({
      type: "image_url",
      image_url: {
        url: `data:image/jpeg;base64,${imageBase64}`,
      },
    }));

    // Prepare the API request to OpenAI with all images
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `You are analyzing multiple images of cryptocurrency portfolios. Compile all the information from these images into a single comprehensive portfolio summary. The createdAt date should be: ${new Date().toISOString()}`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: 'I\'m uploading multiple screenshots of my crypto portfolio from different sources. Please analyze all these images together and compile a complete portfolio summary. Return the data as a JSON array with each entry following this structure: { "createdAt": "ISO date string", "total": "$X,XXX.XX", "crypto": [ { "name": "SYMBOL", "amount": "X.XX", "amountInUsdt": "X,XXX", "parPrice": "$X,XXX" }, ... ] }',
              },
              ...imageContents,
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    // Extract JSON from the response
    // The response might contain markdown or other text, so we need to extract just the JSON part
    const jsonMatch =
      content.match(/```json\n([\s\S]*?)\n```/) ||
      content.match(/```([\s\S]*?)```/) ||
      content.match(/\[([\s\S]*?)\]/) ||
      content.match(/\{[\s\S]*?\}/);

    let portfolioData: PortfolioItem[];

    if (jsonMatch) {
      try {
        // Try to parse the extracted JSON
        const extractedJson = jsonMatch[1] || jsonMatch[0];
        // Check if it's an array or a single object
        if (extractedJson.trim().startsWith("[")) {
          portfolioData = JSON.parse(extractedJson);
        } else {
          // If it's a single object, wrap it in an array
          portfolioData = [JSON.parse(extractedJson)];
        }
      } catch (e) {
        // If parsing fails, try to parse the entire content
        if (content.trim().startsWith("[")) {
          portfolioData = JSON.parse(content);
        } else {
          portfolioData = [JSON.parse(content)];
        }
      }
    } else {
      // If no JSON-like content is found, try to parse the entire content
      if (content.trim().startsWith("[")) {
        portfolioData = JSON.parse(content);
      } else {
        portfolioData = [JSON.parse(content)];
      }
    }

    // Validate and fix each portfolio item
    return portfolioData.map((item) => {
      // Ensure createdAt is present
      if (!item.createdAt) {
        item.createdAt = new Date().toISOString();
      }

      // Calculate total if not provided
      if (!item.total && item.crypto && item.crypto.length > 0) {
        const total = item.crypto.reduce((sum: number, crypto: CryptoItem) => {
          const amountInUsdt = parseFloat(
            crypto.amountInUsdt.replace(/,/g, "")
          );
          return sum + (isNaN(amountInUsdt) ? 0 : amountInUsdt);
        }, 0);

        item.total = `$${total.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      }

      return item;
    });
  } catch (error) {
    console.error("Error analyzing multiple images with OpenAI:", error);
    throw error;
  }
}

/**
 * Analyzes an image using OpenAI's Vision API to extract crypto transaction data
 *
 * @param imageBase64 Base64 encoded image data
 * @returns Extracted transaction data
 */

export async function analyzeTransactionImageWithOpenAI(
  imageBase64: string
): Promise<Transaction> {
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
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `You are a specialized assistant that extracts cryptocurrency transaction data from images. Extract transaction type (buy/sell/transfer), date, coin symbol, amount, price per coin, total value, and any fees. The date should be in ISO format.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: 'Extract the cryptocurrency transaction data from this image. Return ONLY a valid JSON object with the following structure: { "type": "buy" or "sell" or "transfer", "date": "ISO date string", "coin": "SYMBOL", "amount": "X.XX", "pricePerCoin": "X.XX", "totalValue": "X.XX", "fee": "X.XX", "notes": "Any additional information" }',
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    // Extract JSON from the response
    // The response might contain markdown or other text, so we need to extract just the JSON part
    const jsonMatch =
      content.match(/```json\n([\s\S]*?)\n```/) ||
      content.match(/```([\s\S]*?)```/) ||
      content.match(/{[\s\S]*?}/);

    let transactionData: any;

    if (jsonMatch) {
      try {
        // Try to parse the extracted JSON
        transactionData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (e) {
        // If parsing fails, try to parse the entire content
        transactionData = JSON.parse(content);
      }
    } else {
      // If no JSON-like content is found, try to parse the entire content
      transactionData = JSON.parse(content);
    }

    // Validate and fix the transaction data
    if (!transactionData.date) {
      transactionData.date = new Date().toISOString();
    } else if (!(transactionData.date as string).includes("T")) {
      // If the date doesn't include time information, add it
      transactionData.date = new Date(transactionData.date).toISOString();
    }

    // Ensure type is either 'buy', 'sell', or 'transfer'
    if (
      !transactionData.type ||
      (transactionData.type !== "buy" &&
        transactionData.type !== "sell" &&
        transactionData.type !== "transfer")
    ) {
      transactionData.type = "buy"; // Default to buy if not specified or invalid
    }

    // Ensure coin symbol is uppercase
    if (transactionData.coin) {
      transactionData.coin = transactionData.coin.toUpperCase();
    }

    // Ensure numeric fields are strings (as expected by the Transaction type)
    if (typeof transactionData.amount === "number") {
      transactionData.amount = transactionData.amount.toString();
    }
    if (typeof transactionData.pricePerCoin === "number") {
      transactionData.pricePerCoin = transactionData.pricePerCoin.toString();
    }
    if (typeof transactionData.totalValue === "number") {
      transactionData.totalValue = transactionData.totalValue.toString();
    }
    if (typeof transactionData.fee === "number") {
      transactionData.fee = transactionData.fee.toString();
    }

    // Set default fee if not provided
    if (!transactionData.fee) {
      transactionData.fee = "0";
    }

    return transactionData;
  } catch (error) {
    console.error("Error analyzing transaction image with OpenAI:", error);
    throw error;
  }
}

/**
 * Generates crypto market advice and suggestions using OpenAI
 *
 * @param message User's message or question
 * @param marketData Current cryptocurrency market data
 * @param model OpenAI model to use (defaults to gpt-4.1-mini if not specified)
 * @returns AI-generated response with advice and suggestions
 */
export async function generateCryptoAdvice(
  message: string,
  marketData: CryptoMarketData[],
  model: string = "gpt-4.1-mini"
): Promise<string> {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    // Format market data for the prompt
    const topCoins = marketData.slice(0, 10);
    const marketDataText = topCoins
      .map(
        (coin) =>
          `${coin.name} (${coin.symbol}): $${coin.current_price.toFixed(
            2
          )}, 24h change: ${coin.price_change_percentage_24h.toFixed(2)}%`
      )
      .join("\n");

    // Prepare the API request to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: `You are a cryptocurrency market advisor. You provide insights, analysis, and suggestions about cryptocurrency markets.

Current market data (top 10 cryptocurrencies by market cap):
${marketDataText}

Current date: ${new Date().toISOString()}

Important guidelines:
1. Always provide balanced advice, mentioning both potential upsides and risks
2. Remind users that cryptocurrency markets are highly volatile and unpredictable
3. Never make definitive price predictions or guarantees
4. Always suggest diversification and risk management
5. Format your responses in a clear, readable way with sections and bullet points where appropriate
6. If asked about specific coins not in the top 10, acknowledge the limitations of your current market data
7. Provide educational content when appropriate
8. Be conversational and helpful, but professional`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    return content;
  } catch (error) {
    console.error("Error generating crypto advice with OpenAI:", error);
    throw error;
  }
}

/**
 * Generates crypto market advice and suggestions using OpenAI with streaming
 *
 * @param message User's message or question
 * @param marketData Current cryptocurrency market data
 * @param model OpenAI model to use (defaults to gpt-4.1-mini if not specified)
 * @param imageUrl Optional URL of an image to analyze (for multimodal queries)
 * @returns Stream of AI-generated response chunks
 */
/**
 * Generates an image using OpenAI's DALL-E model
 *
 * @param prompt Text prompt describing the image to generate
 * @param size Size of the image to generate (defaults to 1024x1024)
 * @returns URL of the generated image
 */
export async function generateImageWithDallE(
  prompt: string,
  size:
    | "256x256"
    | "512x512"
    | "1024x1024"
    | "1792x1024"
    | "1024x1792" = "1024x1024"
): Promise<string> {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    // Prepare the API request to OpenAI
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: `${prompt} (related to cryptocurrency or finance)`,
          n: 1,
          size: size,
          quality: "standard",
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const imageUrl = data.data[0]?.url;

    if (!imageUrl) {
      throw new Error("No image URL returned from OpenAI");
    }

    return imageUrl;
  } catch (error) {
    console.error("Error generating image with DALL-E:", error);
    throw error;
  }
}

export async function generateCryptoAdviceStream(
  message: string,
  marketData: CryptoMarketData[],
  model: string = "gpt-4.1-mini",
  imageUrl?: string
): Promise<ReadableStream<Uint8Array>> {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    // Format market data for the prompt
    const topCoins = marketData.slice(0, 10);
    const marketDataText = topCoins
      .map(
        (coin) =>
          `${coin.name} (${coin.symbol}): $${coin.current_price.toFixed(
            2
          )}, 24h change: ${coin.price_change_percentage_24h.toFixed(2)}%`
      )
      .join("\n");

    // Prepare the API request to OpenAI with streaming enabled
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: `You are a cryptocurrency market advisor. You provide insights, analysis, and suggestions about cryptocurrency markets.

Current market data (top 10 cryptocurrencies by market cap):
${marketDataText}

Current date: ${new Date().toISOString()}

Important guidelines:
1. Always provide balanced advice, mentioning both potential upsides and risks
2. Remind users that cryptocurrency markets are highly volatile and unpredictable
3. Never make definitive price predictions or guarantees
4. Always suggest diversification and risk management
5. Format your responses in a clear, readable way with sections and bullet points where appropriate
6. If asked about specific coins not in the top 10, acknowledge the limitations of your current market data
7. Provide educational content when appropriate
8. Be conversational and helpful, but professional`,
          },
          {
            role: "user",
            content: imageUrl
              ? [
                  {
                    type: "text",
                    text: message,
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: imageUrl,
                    },
                  },
                ]
              : message,
          },
        ],
        temperature: 0.7,
        stream: true, // Enable streaming
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API error: ${errorData.error?.message || response.statusText}`
      );
    }

    return response.body as ReadableStream<Uint8Array>;
  } catch (error) {
    console.error("Error generating crypto advice stream with OpenAI:", error);
    throw error;
  }
}
