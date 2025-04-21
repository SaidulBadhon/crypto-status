import { PortfolioItem } from '@/types';

// Environment variables should be properly set in .env.local
// BIN_ID and API_KEY should be defined there
const BIN_ID = process.env.NEXT_PUBLIC_JSONBIN_BIN_ID;
const API_KEY = process.env.NEXT_PUBLIC_JSONBIN_API_KEY;

/**
 * Fetches portfolio data from JSONBin
 * @returns {Promise<PortfolioItem[]>} Portfolio data
 */
export const getPortfolioFromJsonBin = async (): Promise<PortfolioItem[]> => {
  if (!BIN_ID || !API_KEY) {
    console.error('JSONBin credentials not configured');
    return [];
  }

  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: {
        'X-Master-Key': API_KEY,
      },
      // Add cache: 'no-store' for dynamic data that changes frequently
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }

    const result = await res.json();
    return result.record || [];
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    throw error;
  }
};

/**
 * Saves portfolio data to JSONBin
 * @param {PortfolioItem[]} data - Portfolio data to save
 * @returns {Promise<PortfolioItem[]>} Updated portfolio data
 */
export const savePortfolioToJsonBin = async (data: PortfolioItem[]): Promise<PortfolioItem[]> => {
  if (!BIN_ID || !API_KEY) {
    console.error('JSONBin credentials not configured');
    throw new Error('JSONBin credentials not configured');
  }

  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`Failed to save: ${res.status} ${res.statusText}`);
    }

    const result = await res.json();
    return result.record;
  } catch (error) {
    console.error('Error saving portfolio data:', error);
    throw error;
  }
};
