import { PortfolioItem } from "@/types";

const LOCAL_STORAGE_KEY = "cryptoPortfolioCache";

interface CacheData {
  data: PortfolioItem[];
  timestamp: string;
}

/**
 * Checks if the cached data is still valid based on the timestamp
 * @param {string} timestamp - ISO timestamp string
 * @returns {boolean} Whether the cache is still valid
 */
const isCacheValid = (timestamp: string): boolean => {
  const cacheTime = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - cacheTime.getTime();

  // Get cache expiry from localStorage or use default (30 minutes)
  const cacheExpiryMinutes = parseInt(
    localStorage.getItem("cacheExpiry") || "30",
    10
  );

  return diffMs < cacheExpiryMinutes * 60 * 1000;
};

/**
 * Gets cached portfolio data if it exists and is still valid
 * @returns {PortfolioItem[] | null} Cached portfolio data or null if not available
 */
const getCachedPortfolio = (): PortfolioItem[] | null => {
  if (typeof window === "undefined") return null; // Server-side check

  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!cached) return null;

  try {
    const parsed = JSON.parse(cached) as CacheData;
    return isCacheValid(parsed.timestamp) ? parsed.data : null;
  } catch (error) {
    console.error("Error parsing cached portfolio data:", error);
    return null;
  }
};

/**
 * Saves portfolio data to localStorage cache
 * @param {PortfolioItem[]} data - Portfolio data to cache
 */
const setCache = (data: PortfolioItem[]): void => {
  if (typeof window === "undefined") return; // Server-side check

  try {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error("Error caching portfolio data:", error);
  }
};

export { getCachedPortfolio, setCache };
