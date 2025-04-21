import { NextRequest, NextResponse } from 'next/server';
import { getAllPortfolioEntries, addPortfolioEntry } from '@/lib/db/portfolio';
import { PortfolioItem } from '@/types';

/**
 * GET /api/portfolio
 * Get all portfolio entries
 */
export async function GET() {
  try {
    const portfolioEntries = await getAllPortfolioEntries();
    return NextResponse.json(portfolioEntries);
  } catch (error) {
    console.error('Error in GET /api/portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio entries' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/portfolio
 * Add a new portfolio entry
 */
export async function POST(request: NextRequest) {
  try {
    const portfolioItem = await request.json() as PortfolioItem;
    
    // Validate the portfolio item
    if (!portfolioItem.createdAt || !portfolioItem.total || !portfolioItem.crypto) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Add the portfolio entry
    const result = await addPortfolioEntry(portfolioItem);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/portfolio:', error);
    
    // Handle duplicate entry error
    if (error.message.includes('already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 } // Conflict
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to add portfolio entry' },
      { status: 500 }
    );
  }
}
