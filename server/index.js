import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
// Try to use MongoDB Atlas first, then fall back to local MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/crypto-status";

console.log(
  `Connecting to MongoDB at: ${
    MONGODB_URI.includes("mongodb+srv")
      ? "MongoDB Atlas (Cloud)"
      : "Local MongoDB"
  }`
);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Define Portfolio Schema
const portfolioSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  total: {
    type: String,
    required: true,
  },
  crypto: [
    {
      name: {
        type: String,
        required: true,
      },
      amount: {
        type: String,
        required: true,
      },
      amountInUsdt: {
        type: String,
        required: true,
      },
      parPrice: {
        type: String,
        required: true,
      },
    },
  ],
});

// Create Portfolio model
const Portfolio = mongoose.model("Portfolio", portfolioSchema);

// Routes
// Get all portfolio entries
app.get("/api/portfolio", async (req, res) => {
  try {
    const portfolioEntries = await Portfolio.find().sort({ createdAt: -1 });
    res.json(portfolioEntries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching portfolio data", error });
  }
});

// Get a specific portfolio entry by ID
app.get("/api/portfolio/:id", async (req, res) => {
  try {
    const portfolioEntry = await Portfolio.findById(req.params.id);

    if (!portfolioEntry) {
      return res.status(404).json({ message: "Portfolio entry not found" });
    }

    res.json(portfolioEntry);
  } catch (error) {
    res.status(500).json({ message: "Error fetching portfolio entry", error });
  }
});

// Create a new portfolio entry
app.post("/api/portfolio", async (req, res) => {
  try {
    const newPortfolioEntry = new Portfolio(req.body);
    const savedEntry = await newPortfolioEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    res.status(400).json({ message: "Error creating portfolio entry", error });
  }
});

// Update a portfolio entry
app.put("/api/portfolio/:id", async (req, res) => {
  try {
    const updatedEntry = await Portfolio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ message: "Portfolio entry not found" });
    }

    res.json(updatedEntry);
  } catch (error) {
    res.status(400).json({ message: "Error updating portfolio entry", error });
  }
});

// Delete a portfolio entry
app.delete("/api/portfolio/:id", async (req, res) => {
  try {
    const deletedEntry = await Portfolio.findByIdAndDelete(req.params.id);

    if (!deletedEntry) {
      return res.status(404).json({ message: "Portfolio entry not found" });
    }

    res.json({ message: "Portfolio entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting portfolio entry", error });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
