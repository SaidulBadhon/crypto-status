const LOCAL_STORAGE_KEY = "cryptoPortfolioCache";
const CACHE_EXPIRY_MINUTES = 30;

const isCacheValid = (timestamp: string) => {
  const cacheTime = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - cacheTime.getTime();
  return diffMs < CACHE_EXPIRY_MINUTES * 60 * 1000;
};

const getCachedPortfolio = () => {
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!cached) return null;

  const parsed = JSON.parse(cached);
  return isCacheValid(parsed.timestamp) ? parsed.data : null;
};

const setCache = (data: any) => {
  localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify({
      data,
      timestamp: new Date().toISOString(),
    })
  );
};

export { getCachedPortfolio, setCache };
