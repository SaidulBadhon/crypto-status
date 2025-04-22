import { Transaction } from "@/types";
import clientPromise from "../mongodb";
import { ObjectId } from "mongodb";

// Database and collection names
const DB_NAME = "crypto-portfolio";
const COLLECTION_NAME = "transactions";

/**
 * Get all transactions
 * @returns Array of transactions
 */
export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Find all documents and sort by date in descending order
    const transactions = await collection.find({}).sort({ date: -1 }).toArray();

    return transactions as unknown as Transaction[];
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
}

/**
 * Get transactions for a specific coin
 * @param coin The coin symbol (e.g., BTC, ETH)
 * @returns Array of transactions for the specified coin
 */
export async function getTransactionsByCoin(
  coin: string
): Promise<Transaction[]> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Find transactions for the specified coin and sort by date in descending order
    const transactions = await collection
      .find({ coin: coin.toUpperCase() })
      .sort({ date: -1 })
      .toArray();

    return transactions as unknown as Transaction[];
  } catch (error) {
    console.error(`Error fetching transactions for ${coin}:`, error);
    throw new Error(`Failed to fetch transactions for ${coin}`);
  }
}

/**
 * Add a new transaction
 * @param transaction The transaction to add
 * @returns The added transaction
 */
export async function addTransaction(transaction: any): Promise<any> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Insert the new transaction
    const result = await collection.insertOne(transaction);

    if (!result.acknowledged) {
      throw new Error("Failed to add transaction");
    }

    // Return the added transaction with its ID
    return {
      ...transaction,
      _id: result.insertedId.toString(),
    };
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw error;
  }
}

/**
 * Update an existing transaction
 * @param id The ID of the transaction to update
 * @param transaction The updated transaction data
 * @returns The updated transaction
 */
export async function updateTransaction(
  id: string,
  transaction: Partial<Transaction>
): Promise<Transaction> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Update the transaction
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: transaction },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new Error("Transaction not found");
    }

    return result as unknown as Transaction;
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw error;
  }
}

/**
 * Delete a transaction
 * @param id The ID of the transaction to delete
 * @returns True if the transaction was deleted
 */
export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Delete the transaction
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    return result.deletedCount === 1;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
}

/**
 * Get a transaction by ID
 * @param id The ID of the transaction to get
 * @returns The transaction
 */
export async function getTransactionById(id: string): Promise<Transaction> {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Find the transaction
    const transaction = await collection.findOne({ _id: new ObjectId(id) });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    return transaction as unknown as Transaction;
  } catch (error) {
    console.error("Error fetching transaction:", error);
    throw error;
  }
}
