import { NextRequest, NextResponse } from "next/server";
import {
  getPortfolioEntryById,
  updatePortfolioEntry,
  deletePortfolioEntry,
} from "@/lib/db/portfolio";
import { PortfolioItem } from "@/types";

/**
 * GET /api/portfolio/[id]
 * Get a portfolio entry by ID
 */
export async function GET(request: NextRequest, { params }: { params: any }) {
  try {
    const id = params.id;
    const portfolioEntry = await getPortfolioEntryById(id);
    return NextResponse.json(portfolioEntry);
  } catch (error) {
    console.error(`Error in GET /api/portfolio/${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio entry" },
      { status: 404 }
    );
  }
}

/**
 * PUT /api/portfolio/[id]
 * Update a portfolio entry
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const portfolioItem = (await request.json()) as Partial<PortfolioItem>;

    // Update the portfolio entry
    const result = await updatePortfolioEntry(id, portfolioItem);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error in PUT /api/portfolio/${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to update portfolio entry" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/portfolio/[id]
 * Delete a portfolio entry
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const result = await deletePortfolioEntry(id);

    if (result) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Portfolio entry not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error(`Error in DELETE /api/portfolio/${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete portfolio entry" },
      { status: 500 }
    );
  }
}
