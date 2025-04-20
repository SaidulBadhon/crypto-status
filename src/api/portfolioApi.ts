// Get the BIN_ID and API_KEY from localStorage or environment variables
const getBinId = () => localStorage.getItem("binId") || import.meta.env.VITE_BIN_ID;
const getApiKey = () => localStorage.getItem("apiKey") || import.meta.env.VITE_BIN_API_KEY;

/**
 * Fetches portfolio data from JSONBin.io
 * @returns {Promise<any[]>} Portfolio data
 */
export const getPortfolioFromJsonBin = async (): Promise<any[]> => {
  const BIN_ID = getBinId();
  const API_KEY = getApiKey();

  if (!BIN_ID || !API_KEY) {
    throw new Error("Missing BIN_ID or API_KEY. Please check your settings.");
  }

  const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
    headers: {
      "X-Master-Key": API_KEY,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
  }

  const result = await res.json();
  return result.record;
};

/**
 * Saves portfolio data to JSONBin.io
 * @param {any[]} data - Portfolio data to save
 * @returns {Promise<any>} Updated portfolio data
 */
export const savePortfolioToJsonBin = async (data: any[]): Promise<any> => {
  const BIN_ID = getBinId();
  const API_KEY = getApiKey();

  if (!BIN_ID || !API_KEY) {
    throw new Error("Missing BIN_ID or API_KEY. Please check your settings.");
  }

  const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Failed to save data: ${res.status} ${res.statusText}`);
  }

  const result = await res.json();
  return result.record;
};
