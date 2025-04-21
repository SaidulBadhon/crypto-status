import axios from 'axios';

const API_BASE_URL = '/api/portfolio';

/**
 * Fetches portfolio data from MongoDB through our backend API
 * @returns {Promise<any[]>} Portfolio data
 */
export const getPortfolioFromMongo = async (): Promise<any[]> => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch portfolio data from MongoDB:', error);
    throw error;
  }
};

/**
 * Saves portfolio data to MongoDB through our backend API
 * @param {any} data - Portfolio data to save
 * @returns {Promise<any>} Saved portfolio data
 */
export const savePortfolioToMongo = async (data: any): Promise<any> => {
  try {
    const response = await axios.post(API_BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Failed to save portfolio data to MongoDB:', error);
    throw error;
  }
};

/**
 * Updates portfolio data in MongoDB through our backend API
 * @param {string} id - ID of the portfolio entry to update
 * @param {any} data - Updated portfolio data
 * @returns {Promise<any>} Updated portfolio data
 */
export const updatePortfolioInMongo = async (id: string, data: any): Promise<any> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update portfolio data in MongoDB:', error);
    throw error;
  }
};

/**
 * Deletes portfolio data from MongoDB through our backend API
 * @param {string} id - ID of the portfolio entry to delete
 * @returns {Promise<any>} Response data
 */
export const deletePortfolioFromMongo = async (id: string): Promise<any> => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete portfolio data from MongoDB:', error);
    throw error;
  }
};

/**
 * Fetches a specific portfolio entry by ID
 * @param {string} id - ID of the portfolio entry to fetch
 * @returns {Promise<any>} Portfolio entry
 */
export const getPortfolioEntryById = async (id: string): Promise<any> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch portfolio entry from MongoDB:', error);
    throw error;
  }
};
