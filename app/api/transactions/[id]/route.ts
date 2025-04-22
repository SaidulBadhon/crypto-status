import { NextRequest, NextResponse } from "next/server";
import {
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "@/lib/db/transactions";
import { Transaction } from "@/types";

/**
 * GET /api/transactions/[id]
 * Get a transaction by ID
 */
export async function GET(request: NextRequest, { params }: { params: any }) {
  try {
    const id = params.id;
    const transaction = await getTransactionById(id);
    return NextResponse.json(transaction);
  } catch (error) {
    console.error(`Error in GET /api/transactions/${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 404 }
    );
  }
}

/**
 * PUT /api/transactions/[id]
 * Update a transaction
 */
export async function PUT(request: NextRequest, { params }: { params: any }) {
  try {
    const id = params.id;
    const transaction = (await request.json()) as Partial<Transaction>;

    // Update the transaction
    const result = await updateTransaction(id, transaction);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error in PUT /api/transactions/${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/transactions/[id]
 * Delete a transaction
 */
export async function DELETE(request: NextRequest, { params }: { params: any }) {
  try {
    const id = params.id;
    const result = await deleteTransaction(id);

    if (result) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error(`Error in DELETE /api/transactions/${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
