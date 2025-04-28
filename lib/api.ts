import { PortfolioItem, Transaction } from "@/types";

/**
 * Fetches all portfolio entries from the API
 * @returns {Promise<PortfolioItem[]>} Portfolio data
 */
export const getPortfolioEntries = async (): Promise<PortfolioItem[]> => {
  try {
    const res = await fetch("/api/portfolio", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Add cache: 'no-store' for dynamic data that changes frequently
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    throw error;
  }
};

/**
 * Adds a new portfolio entry
 * @param {PortfolioItem} entry - Portfolio entry to add
 * @returns {Promise<PortfolioItem>} Added portfolio entry
 */
export const addPortfolioEntry = async (
  entry: PortfolioItem
): Promise<PortfolioItem> => {
  try {
    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error ||
          `Failed to add entry: ${res.status} ${res.statusText}`
      );
    }

    return await res.json();
  } catch (error) {
    console.error("Error adding portfolio entry:", error);
    throw error;
  }
};

/**
 * Adds multiple portfolio entries
 * @param {PortfolioItem[]} entries - Portfolio entries to add
 * @returns {Promise<{success: boolean, count: number, entries: PortfolioItem[]}>} Result with added entries
 */
export const addMultiplePortfolioEntries = async (
  entries: PortfolioItem[]
): Promise<{ success: boolean; count: number; entries: PortfolioItem[] }> => {
  try {
    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entries),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error ||
          `Failed to add entries: ${res.status} ${res.statusText}`
      );
    }

    return await res.json();
  } catch (error) {
    console.error("Error adding multiple portfolio entries:", error);
    throw error;
  }
};

/**
 * Updates an existing portfolio entry
 * @param {string} id - ID of the portfolio entry to update
 * @param {Partial<PortfolioItem>} entry - Updated portfolio entry data
 * @returns {Promise<PortfolioItem>} Updated portfolio entry
 */
export const updatePortfolioEntry = async (
  id: string,
  entry: Partial<PortfolioItem>
): Promise<PortfolioItem> => {
  try {
    const res = await fetch(`/api/portfolio/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    });

    if (!res.ok) {
      throw new Error(
        `Failed to update entry: ${res.status} ${res.statusText}`
      );
    }

    return await res.json();
  } catch (error) {
    console.error("Error updating portfolio entry:", error);
    throw error;
  }
};

/**
 * Deletes a portfolio entry
 * @param {string} id - ID of the portfolio entry to delete
 * @returns {Promise<boolean>} True if the entry was deleted
 */
export const deletePortfolioEntry = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/portfolio/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error(
        `Failed to delete entry: ${res.status} ${res.statusText}`
      );
    }

    const result = await res.json();
    return result.success;
  } catch (error) {
    console.error("Error deleting portfolio entry:", error);
    throw error;
  }
};

/**
 * Gets a portfolio entry by ID
 * @param {string} id - ID of the portfolio entry to get
 * @returns {Promise<PortfolioItem>} Portfolio entry
 */
export const getPortfolioEntryById = async (
  id: string
): Promise<PortfolioItem> => {
  try {
    const res = await fetch(`/api/portfolio/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch entry: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching portfolio entry:", error);
    throw error;
  }
};

/**
 * Imports multiple portfolio entries
 * @param {PortfolioItem[]} data - Portfolio data to import
 * @returns {Promise<{success: boolean, importedCount: number, message: string}>} Import result
 */
export const importPortfolioData = async (
  data: PortfolioItem[]
): Promise<{ success: boolean; importedCount: number; message: string }> => {
  try {
    const res = await fetch("/api/portfolio/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`Failed to import data: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error importing portfolio data:", error);
    throw error;
  }
};

/**
 * Fetches all transactions from the API
 * @param {string} [coin] - Optional coin filter
 * @returns {Promise<Transaction[]>} Transaction data
 */
export const getTransactions = async (
  coin?: string
): Promise<Transaction[]> => {
  try {
    const url = new URL("/api/transactions", window.location.origin);
    if (coin) {
      url.searchParams.append("coin", coin);
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.log(res);
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

/**
 * Adds a new transaction
 * @param {Transaction} transaction - Transaction to add
 * @returns {Promise<Transaction>} Added transaction
 */
export const addTransaction = async (
  transaction: Transaction
): Promise<Transaction> => {
  try {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transaction),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error ||
          `Failed to add transaction: ${res.status} ${res.statusText}`
      );
    }

    return await res.json();
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw error;
  }
};

/**
 * Updates an existing transaction
 * @param {string} id - ID of the transaction to update
 * @param {Partial<Transaction>} transaction - Updated transaction data
 * @returns {Promise<Transaction>} Updated transaction
 */
export const updateTransaction = async (
  id: string,
  transaction: Partial<Transaction>
): Promise<Transaction> => {
  try {
    const res = await fetch(`/api/transactions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transaction),
    });

    if (!res.ok) {
      throw new Error(
        `Failed to update transaction: ${res.status} ${res.statusText}`
      );
    }

    return await res.json();
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw error;
  }
};

/**
 * Deletes a transaction
 * @param {string} id - ID of the transaction to delete
 * @returns {Promise<boolean>} True if the transaction was deleted
 */
export const deleteTransaction = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`/api/transactions/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error(
        `Failed to delete transaction: ${res.status} ${res.statusText}`
      );
    }

    const result = await res.json();
    return result.success;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
};

/**
 * Gets a transaction by ID
 * @param {string} id - ID of the transaction to get
 * @returns {Promise<Transaction>} Transaction
 */
export const getTransactionById = async (id: string): Promise<Transaction> => {
  try {
    const res = await fetch(`/api/transactions/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(
        `Failed to fetch transaction: ${res.status} ${res.statusText}`
      );
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching transaction:", error);
    throw error;
  }
};

/**
 * Analyzes images and extracts portfolio data using OpenAI
 * @param {FormData} formData - Form data containing images
 * @returns {Promise<{success: boolean, portfolioItems: PortfolioItem[]}>} Analysis result
 */
export const analyzeImagesWithOpenAI = async (
  formData: FormData
): Promise<{ success: boolean; portfolioItems: PortfolioItem[] }> => {
  try {
    const res = await fetch("/api/image-analysis", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.message ||
          `Failed to analyze images: ${res.status} ${res.statusText}`
      );
    }

    return await res.json();
  } catch (error) {
    console.error("Error analyzing images:", error);
    throw error;
  }
};

/**
 * Analyzes an image and extracts transaction data using OpenAI
 * @param {FormData} formData - Form data containing the image
 * @returns {Promise<{success: boolean, transaction: Transaction}>} Analysis result
 */
export const analyzeTransactionImageWithOpenAI = async (
  formData: FormData
): Promise<{ success: boolean; transaction: Transaction }> => {
  try {
    const res = await fetch("/api/transaction-image-analysis", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.message ||
          `Failed to analyze image: ${res.status} ${res.statusText}`
      );
    }

    return await res.json();
  } catch (error) {
    console.error("Error analyzing transaction image:", error);
    throw error;
  }
};

/**
 * Generates an image using OpenAI's DALL-E model
 * @param {string} prompt - Text prompt describing the image to generate
 * @param {string} size - Size of the image to generate (defaults to 1024x1024)
 * @returns {Promise<{success: boolean, imageUrl: string}>} Generation result
 */
export const generateImageWithDallE = async (
  prompt: string,
  size: string = "1024x1024"
): Promise<{ success: boolean; imageUrl: string }> => {
  try {
    const res = await fetch("/api/copilot/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, size }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.message ||
          `Failed to generate image: ${res.status} ${res.statusText}`
      );
    }

    return await res.json();
  } catch (error) {
    console.error("Error generating image with DALL-E:", error);
    throw error;
  }
};
