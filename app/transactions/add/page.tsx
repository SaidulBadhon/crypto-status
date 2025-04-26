"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { Transaction, TransactionType } from "@/types";
import { addTransaction } from "@/lib/api";

export default function AddTransactionPage() {
  const router = useRouter();
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
      const transaction: Transaction = {
        type: formData.type,
        date: new Date(formData.date).toISOString(),
        coin: formData.coin.toUpperCase(),
        amount: formData.amount,
        pricePerCoin: formData.pricePerCoin,
        totalValue: formData.totalValue,
        fee: formData.fee || "0",
        notes: formData.notes || undefined,
      };

      // Add transaction
      await addTransaction(transaction);

      // Redirect to transactions page
      router.push("/transactions");
    } catch (err: any) {
      setError(err.message || "Failed to add transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h1 className="text-3xl font-bold">Add Transaction</h1>
        <p className="text-muted-foreground">
          Record a new cryptocurrency buy or sell transaction
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>
                Enter the details of your transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-100 border border-red-200 text-red-800 rounded-md">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="buy">Buy</option>
                      <option value="sell">Sell</option>
                      <option value="transfer">Transfer</option>
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
                      type="datetime-local"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Coin */}
                  <div className="space-y-2">
                    <label
                      htmlFor="coin"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Coin Symbol
                    </label>
                    <input
                      type="text"
                      id="coin"
                      name="coin"
                      placeholder="BTC"
                      value={formData.coin}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                      type="text"
                      id="amount"
                      name="amount"
                      placeholder="0.01"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Price Per Coin */}
                  <div className="space-y-2">
                    <label
                      htmlFor="pricePerCoin"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Price Per Coin (USDT)
                    </label>
                    <input
                      type="text"
                      id="pricePerCoin"
                      name="pricePerCoin"
                      placeholder="30000"
                      value={formData.pricePerCoin}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {/* Total Value */}
                  <div className="space-y-2">
                    <label
                      htmlFor="totalValue"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Total Value (USDT)
                    </label>
                    <input
                      type="text"
                      id="totalValue"
                      name="totalValue"
                      placeholder="300"
                      value={formData.totalValue}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Fee */}
                <div className="space-y-2">
                  <label
                    htmlFor="fee"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Transaction Fee (USDT)
                  </label>
                  <input
                    type="text"
                    id="fee"
                    name="fee"
                    placeholder="0"
                    value={formData.fee}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "Saving..." : "Save Transaction"}
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
                Helpful information for adding transactions
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
                  <br />
                  <strong>Transfer:</strong> When you move cryptocurrency
                  between wallets or exchanges without buying or selling.
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
