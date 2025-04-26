"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { Transaction, TransactionType } from "@/types";
import { getTransactionById, updateTransaction } from "@/lib/api";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    type: TransactionType;
    date: string;
    coin: string;
    amount: string;
    pricePerCoin: string;
    totalValue: string;
    fee: string;
    notes: string;
  }>({
    type: "buy",
    date: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:MM
    coin: "",
    amount: "",
    pricePerCoin: "",
    totalValue: "",
    fee: "0",
    notes: "",
  });

  // Fetch transaction data
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const transaction = await getTransactionById(id);

        // Format the date for the datetime-local input (YYYY-MM-DDTHH:MM)
        const formattedDate = new Date(transaction.date)
          .toISOString()
          .slice(0, 16);

        setFormData({
          type: transaction.type,
          date: formattedDate,
          coin: transaction.coin,
          amount: transaction.amount,
          pricePerCoin: transaction.pricePerCoin,
          totalValue: transaction.totalValue,
          fee: transaction.fee,
          notes: transaction.notes || "",
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch transaction:", err);
        setError("Failed to load transaction data");
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-calculate total value when amount or price changes
    if (name === "amount" || name === "pricePerCoin") {
      const amount = name === "amount" ? value : formData.amount;
      const price = name === "pricePerCoin" ? value : formData.pricePerCoin;

      if (amount && price) {
        try {
          const amountNum = parseFloat(amount.replace(/,/g, ""));
          const priceNum = parseFloat(price.replace(/,/g, ""));
          const total = (amountNum * priceNum).toFixed(2);
          setFormData((prev) => ({ ...prev, totalValue: total }));
        } catch (err) {
          // Ignore calculation errors
        }
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form data
      if (!formData.coin) throw new Error("Coin symbol is required");
      if (!formData.amount) throw new Error("Amount is required");
      if (!formData.pricePerCoin) throw new Error("Price per coin is required");
      if (!formData.totalValue) throw new Error("Total value is required");

      // Create transaction object
      const transaction: Partial<Transaction> = {
        type: formData.type,
        date: new Date(formData.date).toISOString(),
        coin: formData.coin.toUpperCase(),
        amount: formData.amount,
        pricePerCoin: formData.pricePerCoin,
        totalValue: formData.totalValue,
        fee: formData.fee || "0",
        notes: formData.notes || undefined,
      };

      // Update transaction
      await updateTransaction(id, transaction);

      // Redirect to transactions page
      router.push("/transactions");
    } catch (err: any) {
      setError(err.message || "Failed to update transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading transaction data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/transactions"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Transactions
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Edit Transaction</h1>
        <p className="text-muted-foreground">
          Update the details of your cryptocurrency transaction
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>
                Edit the details of your transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-100 border border-red-200 text-red-800 rounded-md">
                    {error}
                  </div>
                )}

                {/* Transaction Type */}
                <div className="space-y-2">
                  <label
                    htmlFor="type"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Transaction Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label
                    htmlFor="date"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Date & Time
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Coin */}
                <div className="space-y-2">
                  <label
                    htmlFor="coin"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Coin Symbol
                  </label>
                  <input
                    id="coin"
                    name="coin"
                    type="text"
                    placeholder="BTC, ETH, etc."
                    value={formData.coin}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label
                    htmlFor="amount"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Amount
                  </label>
                  <input
                    id="amount"
                    name="amount"
                    type="text"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Price Per Coin */}
                <div className="space-y-2">
                  <label
                    htmlFor="pricePerCoin"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Price Per Coin (USD)
                  </label>
                  <input
                    id="pricePerCoin"
                    name="pricePerCoin"
                    type="text"
                    placeholder="0.00"
                    value={formData.pricePerCoin}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Total Value */}
                <div className="space-y-2">
                  <label
                    htmlFor="totalValue"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Total Value (USD)
                  </label>
                  <input
                    id="totalValue"
                    name="totalValue"
                    type="text"
                    placeholder="0.00"
                    value={formData.totalValue}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Fee */}
                <div className="space-y-2">
                  <label
                    htmlFor="fee"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Transaction Fee (USD)
                  </label>
                  <input
                    id="fee"
                    name="fee"
                    type="text"
                    placeholder="0.00"
                    value={formData.fee}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label
                    htmlFor="notes"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    placeholder="Add any additional notes about this transaction"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Transaction
                      </>
                    )}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
              <CardDescription>
                Helpful information for editing transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Transaction Types</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Buy:</strong> When you purchase cryptocurrency with
                  fiat or another crypto.
                  <br />
                  <strong>Sell:</strong> When you sell cryptocurrency for fiat
                  or another crypto.
                </p>
              </div>

              <div>
                <h3 className="font-medium">Coin Symbol</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Use standard cryptocurrency symbols like BTC, ETH, NEAR, etc.
                </p>
              </div>

              <div>
                <h3 className="font-medium">Amount</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the exact amount of cryptocurrency bought or sold.
                </p>
              </div>

              <div>
                <h3 className="font-medium">Price & Value</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the price per coin and the total value will be
                  calculated automatically. You can also adjust the total value
                  manually if needed.
                </p>
              </div>

              <div>
                <h3 className="font-medium">Transaction Fee</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Include any exchange or network fees associated with this
                  transaction. Enter 0 if there were no fees.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
