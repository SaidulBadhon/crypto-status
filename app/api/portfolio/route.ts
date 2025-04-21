import { NextRequest, NextResponse } from "next/server";
import {
  getAllPortfolioEntries,
  addPortfolioEntry,
  addMultiplePortfolioEntries,
} from "@/lib/db/portfolio";
import { PortfolioItem } from "@/types";

/**
 * GET /api/portfolio
 * Get all portfolio entries
 */
export async function GET() {
  try {
    const portfolioEntries = await getAllPortfolioEntries();
    return NextResponse.json(portfolioEntries);
  } catch (error) {
    console.error("Error in GET /api/portfolio:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio entries" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/portfolio
 * Add a new portfolio entry or multiple entries
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Check if the data is an array or a single object
    if (Array.isArray(data)) {
      // Handle array of portfolio items
      const portfolioItems = data as PortfolioItem[];

      // Validate each portfolio item
      for (const item of portfolioItems) {
        if (!item.createdAt || !item.total || !item.crypto) {
          return NextResponse.json(
            { error: `Missing required fields in one of the entries` },
            { status: 400 }
          );
        }
      }

      // Add multiple portfolio entries
      const results = await addMultiplePortfolioEntries(portfolioItems);
      return NextResponse.json(
        {
          success: true,
          count: results.length,
          entries: results,
        },
        { status: 201 }
      );
    } else {
      // Handle single portfolio item
      const portfolioItem = data as PortfolioItem;

      // Validate the portfolio item
      if (
        !portfolioItem.createdAt ||
        !portfolioItem.total ||
        !portfolioItem.crypto
      ) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Add the portfolio entry
      const result = await addPortfolioEntry(portfolioItem);
      return NextResponse.json(result, { status: 201 });
    }
  } catch (error: any) {
    console.error("Error in POST /api/portfolio:", error);

    // Handle duplicate entry error
    if (error.message.includes("already exists")) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 } // Conflict
      );
    }

    return NextResponse.json(
      { error: "Failed to add portfolio entry" },
      { status: 500 }
    );
  }
}
