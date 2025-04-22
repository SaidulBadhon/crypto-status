"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowUpDown,
  Plus,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Filter,
  X,
} from "lucide-react";
import { getTransactions } from "@/lib/api";
import { Transaction, TransactionStats, TransactionType } from "@/types";
import Link from "next/link";
import moment from "moment";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<TransactionStats>({
    totalBuyValue: 0,
    totalSellValue: 0,
    totalFees: 0,
    totalProfit: 0,
    profitPercentage: 0,
    trend: "neutral",
  });
  const [filterCoin, setFilterCoin] = useState<string>("");
  const [sortField, setSortField] = useState<keyof Transaction>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Fetch transactions with proper error handling
  const fetchTransactions = useCallback(async (coin?: string) => {
    setIsLoading(true);

    try {
      // Fetch from API
      const data = await getTransactions(coin);
      setTransactions(data);
      calculateStats(data);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      // Could show an error toast/notification here
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate transaction statistics
  const calculateStats = (transactionData: Transaction[]) => {
    if (!transactionData.length) {
      setStats({
        totalBuyValue: 0,
        totalSellValue: 0,
        totalFees: 0,
        totalProfit: 0,
        profitPercentage: 0,
        trend: "neutral",
      });
      return;
    }

    const totalBuyValue = transactionData
      .filter((t) => t.type === "buy")
      .reduce(
        (sum, t) => sum + parseFloat(t.totalValue.replace(/,/g, "")),
        0
      );

    const totalSellValue = transactionData
      .filter((t) => t.type === "sell")
      .reduce(
        (sum, t) => sum + parseFloat(t.totalValue.replace(/,/g, "")),
        0
      );

    const totalFees = transactionData.reduce(
      (sum, t) => sum + parseFloat(t.fee.replace(/,/g, "")),
      0
    );

    const totalProfit = totalSellValue - totalBuyValue - totalFees;
    const profitPercentage =
      totalBuyValue > 0 ? (totalProfit / totalBuyValue) * 100 : 0;

    setStats({
      totalBuyValue,
      totalSellValue,
      totalFees,
      totalProfit,
      profitPercentage,
      trend: totalProfit > 0 ? "profit" : totalProfit < 0 ? "loss" : "neutral",
    });
  };

  // Initial data fetch
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterCoin(e.target.value);
  };

  // Apply filter
  const applyFilter = () => {
    fetchTransactions(filterCoin);
  };

  // Clear filter
  const clearFilter = () => {
    setFilterCoin("");
    fetchTransactions();
  };

  // Handle sort
  const handleSort = (field: keyof Transaction) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to descending
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Sort transactions
  const sortedTransactions = [...transactions].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle string values that represent numbers
    if (
      sortField === "amount" ||
      sortField === "pricePerCoin" ||
      sortField === "totalValue" ||
      sortField === "fee"
    ) {
      aValue = parseFloat(aValue.replace(/,/g, ""));
      bValue = parseFloat(bValue.replace(/,/g, ""));
    }

    // Handle date
    if (sortField === "date") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-3 border-b">
            <div className="h-4 bg-muted rounded w-16"></div>
          </td>
          <td className="px-4 py-3 border-b">
            <div className="h-4 bg-muted rounded w-24"></div>
          </td>
          <td className="px-4 py-3 border-b">
            <div className="h-4 bg-muted rounded w-12"></div>
          </td>
          <td className="px-4 py-3 border-b">
            <div className="h-4 bg-muted rounded w-16"></div>
          </td>
          <td className="px-4 py-3 border-b">
            <div className="h-4 bg-muted rounded w-20"></div>
          </td>
          <td className="px-4 py-3 border-b">
            <div className="h-4 bg-muted rounded w-20"></div>
          </td>
          <td className="px-4 py-3 border-b">
            <div className="h-4 bg-muted rounded w-12"></div>
          </td>
        </tr>
      ));
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">
          Track your cryptocurrency buy and sell transactions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Buy Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalBuyValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total amount spent on purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sell Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalSellValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total amount received from sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalFees)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total transaction fees paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div
                className={`text-2xl font-bold ${
                  stats.trend === "profit"
                    ? "text-green-500"
                    : stats.trend === "loss"
                    ? "text-red-500"
                    : ""
                }`}
              >
                {formatCurrency(stats.totalProfit)}
              </div>
              {stats.trend !== "neutral" && (
                <div
                  className={`flex items-center text-xs ${
                    stats.trend === "profit"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {stats.trend === "profit" ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(stats.profitPercentage).toFixed(2)}%
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total profit or loss
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions and Filters */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => fetchTransactions(filterCoin)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Refresh
              </>
            )}
          </button>
          <Link
            href="/transactions/add"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </Link>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <input
              type="text"
              value={filterCoin}
              onChange={handleFilterChange}
              placeholder="Filter by coin..."
              className="px-4 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {filterCoin && (
              <button
                onClick={clearFilter}
                className="absolute right-10 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={applyFilter}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Your cryptocurrency buy and sell transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th
                    className="px-4 py-2 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("type")}
                  >
                    <div className="flex items-center gap-1">
                      Type
                      {sortField === "type" && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-2 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      {sortField === "date" && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-2 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("coin")}
                  >
                    <div className="flex items-center gap-1">
                      Coin
                      {sortField === "coin" && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-2 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("amount")}
                  >
                    <div className="flex items-center gap-1">
                      Amount
                      {sortField === "amount" && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-2 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("pricePerCoin")}
                  >
                    <div className="flex items-center gap-1">
                      Price
                      {sortField === "pricePerCoin" && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-2 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("totalValue")}
                  >
                    <div className="flex items-center gap-1">
                      Total Value
                      {sortField === "totalValue" && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-2 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("fee")}
                  >
                    <div className="flex items-center gap-1">
                      Fee
                      {sortField === "fee" && (
                        <ArrowUpDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  renderSkeletons()
                ) : sortedTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No transactions found. Add your first transaction to get
                      started.
                    </td>
                  </tr>
                ) : (
                  sortedTransactions.map((transaction) => (
                    <tr
                      key={transaction._id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-3 border-b">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.type === "buy"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {transaction.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b">
                        {moment(transaction.date).format("MMM D, YYYY HH:mm")}
                      </td>
                      <td className="px-4 py-3 border-b font-medium">
                        {transaction.coin}
                      </td>
                      <td className="px-4 py-3 border-b">
                        {transaction.amount}
                      </td>
                      <td className="px-4 py-3 border-b">
                        ${transaction.pricePerCoin}
                      </td>
                      <td className="px-4 py-3 border-b">
                        ${transaction.totalValue}
                      </td>
                      <td className="px-4 py-3 border-b">${transaction.fee}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
