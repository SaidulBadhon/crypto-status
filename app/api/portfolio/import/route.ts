import { NextRequest, NextResponse } from 'next/server';
import { importPortfolioEntries } from '@/lib/db/portfolio';
import { PortfolioItem } from '@/types';

/**
 * POST /api/portfolio/import
 * Import multiple portfolio entries (for migration from JSONBin)
 */
export async function POST(request: NextRequest) {
  try {
    const portfolioItems = await request.json() as PortfolioItem[];
    
    // Validate the portfolio items
    if (!Array.isArray(portfolioItems) || portfolioItems.length === 0) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected non-empty array of portfolio items.' },
        { status: 400 }
      );
    }
    
    // Import the portfolio entries
    const importedCount = await importPortfolioEntries(portfolioItems);
    
    return NextResponse.json({
      success: true,
      importedCount,
      message: `Successfully imported ${importedCount} portfolio entries.`
    });
  } catch (error) {
    console.error('Error in POST /api/portfolio/import:', error);
    return NextResponse.json(
      { error: 'Failed to import portfolio entries' },
      { status: 500 }
    );
  }
}
