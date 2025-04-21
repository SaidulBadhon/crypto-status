import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import routes
import portfolioRoutes from "./routes/portfolio.js";

// Import DB connection
import connectDB from "./config/db.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/portfolio", portfolioRoutes);

// Basic route for testing
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
