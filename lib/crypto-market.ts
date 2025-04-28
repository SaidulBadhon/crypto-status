/**
 * Service for fetching cryptocurrency market data
 */

// Define types for crypto market data
export interface CryptoMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d?: number;
  price_change_percentage_30d?: number;
  total_volume: number;
  circulating_supply: number;
  last_updated: string;
}

/**
 * Fetches current cryptocurrency market data
 * @param limit Number of cryptocurrencies to fetch (default: 50)
 * @returns Array of cryptocurrency market data
 */
export async function getCryptoMarketData(limit: number = 50): Promise<CryptoMarketData[]> {
  try {
    // Using CoinGecko API (free tier)
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h,7d,30d`,
      {
        headers: {
          "Accept": "application/json",
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch crypto market data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as CryptoMarketData[];
  } catch (error) {
    console.error("Error fetching crypto market data:", error);
    throw error;
  }
}

/**
 * Fetches market data for a specific cryptocurrency
 * @param coinId Cryptocurrency ID (e.g., 'bitcoin', 'ethereum')
 * @returns Cryptocurrency market data
 */
export async function getCryptoById(coinId: string): Promise<CryptoMarketData> {
  try {
    const allCoins = await getCryptoMarketData(100);
    const coin = allCoins.find(c => c.id === coinId || c.symbol.toLowerCase() === coinId.toLowerCase());
    
    if (!coin) {
      throw new Error(`Cryptocurrency with ID or symbol '${coinId}' not found`);
    }
    
    return coin;
  } catch (error) {
    console.error(`Error fetching data for crypto '${coinId}':`, error);
    throw error;
  }
}

/**
 * Analyzes market trends and provides buy/sell recommendations
 * @param coinId Cryptocurrency ID (e.g., 'bitcoin', 'ethereum')
 * @returns Analysis and recommendation
 */
export async function analyzeCryptoTrend(coinId: string): Promise<{
  recommendation: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
}> {
  try {
    const coin = await getCryptoById(coinId);
    
    // Simple analysis based on 24h price change
    // In a real app, this would be much more sophisticated
    const priceChange24h = coin.price_change_percentage_24h || 0;
    
    if (priceChange24h > 5) {
      return {
        recommendation: 'sell',
        confidence: Math.min(Math.abs(priceChange24h) / 10, 0.9),
        reasoning: `${coin.name} has increased by ${priceChange24h.toFixed(2)}% in the last 24 hours, which might indicate a short-term peak.`
      };
    } else if (priceChange24h < -5) {
      return {
        recommendation: 'buy',
        confidence: Math.min(Math.abs(priceChange24h) / 10, 0.9),
        reasoning: `${coin.name} has decreased by ${Math.abs(priceChange24h).toFixed(2)}% in the last 24 hours, which might present a buying opportunity.`
      };
    } else {
      return {
        recommendation: 'hold',
        confidence: 0.6,
        reasoning: `${coin.name} has been relatively stable (${priceChange24h.toFixed(2)}% change) in the last 24 hours.`
      };
    }
  } catch (error) {
    console.error(`Error analyzing trend for crypto '${coinId}':`, error);
    throw error;
  }
}

/**
 * Gets top trending cryptocurrencies
 * @param limit Number of trending cryptocurrencies to return
 * @returns Array of trending cryptocurrencies
 */
export async function getTrendingCryptos(limit: number = 5): Promise<CryptoMarketData[]> {
  try {
    const allCoins = await getCryptoMarketData(100);
    
    // Sort by absolute price change (both positive and negative)
    return allCoins
      .sort((a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h))
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching trending cryptos:", error);
    throw error;
  }
}
