import { NextRequest, NextResponse } from "next/server";
import { getCryptoMarketData, getCryptoById, analyzeCryptoTrend, getTrendingCryptos } from "@/lib/crypto-market";

/**
 * GET /api/crypto-market
 * Get cryptocurrency market data
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit") as string) : 50;
    const coinId = searchParams.get("coinId");
    const trending = searchParams.has("trending");

    if (coinId) {
      // Get data for a specific cryptocurrency
      const coin = await getCryptoById(coinId);
      return NextResponse.json(coin);
    } else if (trending) {
      // Get trending cryptocurrencies
      const trendingLimit = searchParams.get("limit") ? parseInt(searchParams.get("limit") as string) : 5;
      const trendingCoins = await getTrendingCryptos(trendingLimit);
      return NextResponse.json(trendingCoins);
    } else {
      // Get all cryptocurrency market data
      const marketData = await getCryptoMarketData(limit);
      return NextResponse.json(marketData);
    }
  } catch (error: any) {
    console.error("Error in GET /api/crypto-market:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch crypto market data",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/crypto-market/analyze
 * Analyze a cryptocurrency and provide buy/sell recommendations
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { coinId } = data;

    if (!coinId) {
      return NextResponse.json(
        { error: "No coinId provided" },
        { status: 400 }
      );
    }

    // Analyze the cryptocurrency
    const analysis = await analyzeCryptoTrend(coinId);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error("Error in POST /api/crypto-market/analyze:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze cryptocurrency",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
