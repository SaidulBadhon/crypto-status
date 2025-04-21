import { PortfolioItem } from '@/types';
import clientPromise from '../mongodb';
import { ObjectId } from 'mongodb';

// Database and collection names
const DB_NAME = 'crypto-portfolio';
const COLLECTION_NAME = 'portfolios';

/**
 * Get all portfolio entries
 * @returns Array of portfolio items
 */
export async function getAllPortfolioEntries(): Promise<PortfolioItem[]> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Find all documents and sort by createdAt in descending order
    const portfolios = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return portfolios as unknown as PortfolioItem[];
  } catch (error) {
    console.error('Error fetching portfolio entries:', error);
    throw new Error('Failed to fetch portfolio entries');
  }
}

/**
 * Add a new portfolio entry
 * @param portfolioItem The portfolio item to add
 * @returns The added portfolio item
 */
export async function addPortfolioEntry(portfolioItem: PortfolioItem): Promise<PortfolioItem> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Check if an entry with the same timestamp already exists
    const existingEntry = await collection.findOne({ createdAt: portfolioItem.createdAt });
    if (existingEntry) {
      throw new Error('An entry with this timestamp already exists');
    }
    
    // Insert the new portfolio entry
    const result = await collection.insertOne(portfolioItem);
    
    if (!result.acknowledged) {
      throw new Error('Failed to add portfolio entry');
    }
    
    return portfolioItem;
  } catch (error) {
    console.error('Error adding portfolio entry:', error);
    throw error;
  }
}

/**
 * Update an existing portfolio entry
 * @param id The ID of the portfolio entry to update
 * @param portfolioItem The updated portfolio item
 * @returns The updated portfolio item
 */
export async function updatePortfolioEntry(
  id: string, 
  portfolioItem: Partial<PortfolioItem>
): Promise<PortfolioItem> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Update the portfolio entry
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: portfolioItem },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new Error('Portfolio entry not found');
    }
    
    return result as unknown as PortfolioItem;
  } catch (error) {
    console.error('Error updating portfolio entry:', error);
    throw error;
  }
}

/**
 * Delete a portfolio entry
 * @param id The ID of the portfolio entry to delete
 * @returns True if the entry was deleted
 */
export async function deletePortfolioEntry(id: string): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Delete the portfolio entry
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    return result.deletedCount === 1;
  } catch (error) {
    console.error('Error deleting portfolio entry:', error);
    throw error;
  }
}

/**
 * Get a portfolio entry by ID
 * @param id The ID of the portfolio entry to get
 * @returns The portfolio entry
 */
export async function getPortfolioEntryById(id: string): Promise<PortfolioItem> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Find the portfolio entry
    const portfolioEntry = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!portfolioEntry) {
      throw new Error('Portfolio entry not found');
    }
    
    return portfolioEntry as unknown as PortfolioItem;
  } catch (error) {
    console.error('Error fetching portfolio entry:', error);
    throw error;
  }
}

/**
 * Import multiple portfolio entries (for migration from JSONBin)
 * @param portfolioItems Array of portfolio items to import
 * @returns Number of imported items
 */
export async function importPortfolioEntries(portfolioItems: PortfolioItem[]): Promise<number> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Insert multiple portfolio entries
    const result = await collection.insertMany(portfolioItems);
    
    return result.insertedCount;
  } catch (error) {
    console.error('Error importing portfolio entries:', error);
    throw error;
  }
}
