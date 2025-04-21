import { PortfolioItem } from "@/types";

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
