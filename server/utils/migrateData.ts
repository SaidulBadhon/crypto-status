import dotenv from 'dotenv';
import axios from 'axios';
import mongoose from 'mongoose';
import Portfolio from '../models/Portfolio';
import connectDB from '../config/db';

// Load environment variables
dotenv.config();

// Get JSONBin credentials from environment variables
const BIN_ID = process.env.VITE_BIN_ID;
const API_KEY = process.env.VITE_BIN_API_KEY;

// Function to fetch data from JSONBin
const fetchFromJsonBin = async (): Promise<any[]> => {
  if (!BIN_ID || !API_KEY) {
    throw new Error('Missing BIN_ID or API_KEY. Please check your .env file.');
  }

  try {
    const res = await axios.get(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: {
        'X-Master-Key': API_KEY,
      },
    });

    return res.data.record;
  } catch (error) {
    console.error('Error fetching data from JSONBin:', error);
    throw error;
  }
};

// Function to migrate data to MongoDB
const migrateToMongoDB = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Fetch data from JSONBin
    const jsonBinData = await fetchFromJsonBin();
    console.log(`Fetched ${jsonBinData.length} records from JSONBin`);

    // Check if we already have data in MongoDB
    const existingCount = await Portfolio.countDocuments();
    console.log(`Found ${existingCount} existing records in MongoDB`);

    if (existingCount > 0) {
      console.log('Data already exists in MongoDB. Skipping migration.');
      process.exit(0);
    }

    // Insert data into MongoDB
    const result = await Portfolio.insertMany(jsonBinData);
    console.log(`Successfully migrated ${result.length} records to MongoDB`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run the migration
migrateToMongoDB();
