import {
  getPortfolioFromJsonBin,
  savePortfolioToJsonBin,
} from "../api/portfolioApi";
import {
  getPortfolioFromMongo,
  savePortfolioToMongo,
  updatePortfolioInMongo,
  deletePortfolioFromMongo,
  getPortfolioEntryById,
} from "../api/mongoApi";

// Data source type
export type DataSource = "jsonbin" | "mongodb";

// Get the current data source from localStorage or default to 'jsonbin'
export const getDataSource = (): DataSource => {
  return (localStorage.getItem("dataSource") as DataSource) || "jsonbin";
};

// Set the data source in localStorage
export const setDataSource = (source: DataSource): void => {
  localStorage.setItem("dataSource", source);
};

// Get portfolio data from the selected data source
export const getPortfolio = async (): Promise<any[]> => {
  const source = getDataSource();

  if (source === "mongodb") {
    return getPortfolioFromMongo();
  } else {
    return getPortfolioFromJsonBin();
  }
};

// Save portfolio data to the selected data source
export const savePortfolio = async (data: any): Promise<any> => {
  const source = getDataSource();

  if (source === "mongodb") {
    // Check if data is an array or a single item
    if (Array.isArray(data)) {
      // If it's an array, save each item individually
      const results = [];
      for (const item of data) {
        const result = await savePortfolioToMongo(item);
        results.push(result);
      }
      return results;
    } else {
      // If it's a single item, save it directly
      return savePortfolioToMongo(data);
    }
  } else {
    // For JSONBin, always save the entire array
    return savePortfolioToJsonBin(data);
  }
};

// Update portfolio data in the selected data source
export const updatePortfolio = async (id: string, data: any): Promise<any> => {
  const source = getDataSource();

  if (source === "mongodb") {
    return updatePortfolioInMongo(id, data);
  } else {
    // JSONBin doesn't support individual updates, so we need to get all data and update it
    const allData = await getPortfolioFromJsonBin();
    const index = allData.findIndex((item: any) => item._id === id);

    if (index !== -1) {
      allData[index] = { ...allData[index], ...data };
      return savePortfolioToJsonBin(allData);
    }

    throw new Error("Portfolio entry not found");
  }
};

// Delete portfolio data from the selected data source
export const deletePortfolio = async (id: string): Promise<any> => {
  const source = getDataSource();

  if (source === "mongodb") {
    return deletePortfolioFromMongo(id);
  } else {
    // JSONBin doesn't support individual deletes, so we need to get all data and filter it
    const allData = await getPortfolioFromJsonBin();
    const filteredData = allData.filter((item: any) => item._id !== id);

    if (allData.length === filteredData.length) {
      throw new Error("Portfolio entry not found");
    }

    return savePortfolioToJsonBin(filteredData);
  }
};

// Get a specific portfolio entry by ID
export const getPortfolioById = async (id: string): Promise<any> => {
  const source = getDataSource();

  if (source === "mongodb") {
    return getPortfolioEntryById(id);
  } else {
    const allData = await getPortfolioFromJsonBin();
    const entry = allData.find((item: any) => item._id === id);

    if (!entry) {
      throw new Error("Portfolio entry not found");
    }

    return entry;
  }
};
