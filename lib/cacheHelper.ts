const LOCAL_STORAGE_KEY = "cryptoPortfolioCache";

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
 * @returns {any[] | null} Cached portfolio data or null if not available
 */
const getCachedPortfolio = (): any[] | null => {
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!cached) return null;

  try {
    const parsed = JSON.parse(cached);
    return isCacheValid(parsed.timestamp) ? parsed.data : null;
  } catch (error) {
    console.error("Error parsing cached portfolio data:", error);
    return null;
  }
};

/**
 * Saves portfolio data to localStorage cache
 * @param {any[]} data - Portfolio data to cache
 */
const setCache = (data: any[]): void => {
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
