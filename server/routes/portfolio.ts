import express, { Request, Response } from "express";
import Portfolio from "../models/Portfolio.js";

const router = express.Router();

// Get all portfolio entries
router.get("/", async (_req: Request, res: Response) => {
  try {
    const portfolioEntries = await Portfolio.find().sort({ createdAt: -1 });
    res.json(portfolioEntries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching portfolio data", error });
  }
});

// Get a specific portfolio entry by ID
router.get("/:id", async (req: Request, res: Response) => {
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
router.post("/", async (req: Request, res: Response) => {
  try {
    const newPortfolioEntry = new Portfolio(req.body);
    const savedEntry = await newPortfolioEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    res.status(400).json({ message: "Error creating portfolio entry", error });
  }
});

// Update a portfolio entry
router.put("/:id", async (req: Request, res: Response) => {
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
router.delete("/:id", async (req: Request, res: Response) => {
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

export default router;
