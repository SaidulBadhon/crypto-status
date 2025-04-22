import { NextRequest, NextResponse } from "next/server";
import {
  getAllTransactions,
  addTransaction,
  getTransactionsByCoin,
} from "@/lib/db/transactions";
import { Transaction } from "@/types";

/**
 * GET /api/transactions
 * Get all transactions or filter by coin
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const coin = searchParams.get("coin");

    let transactions;
    if (coin) {
      // Get transactions for a specific coin
      transactions = await getTransactionsByCoin(coin);
    } else {
      // Get all transactions
      transactions = await getAllTransactions();
    }

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error in GET /api/transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transactions
 * Add a new transaction
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const transaction = data as Transaction;

    // Validate the transaction
    if (!transaction.type || !transaction.date || !transaction.coin || !transaction.amount || !transaction.pricePerCoin || !transaction.totalValue || !transaction.fee) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Add the transaction
    const result = await addTransaction(transaction);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/transactions:", error);
    return NextResponse.json(
      { error: "Failed to add transaction" },
      { status: 500 }
    );
  }
}
