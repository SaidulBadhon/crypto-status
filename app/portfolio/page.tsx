"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import ItemCard from "@/components/ItemCard";
import { getPortfolioEntries } from "@/lib/api";

import Link from "next/link";
import { PortfolioItem } from "@/types";
import { RefreshCw, Plus } from "lucide-react";

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Memoize sorted portfolio to prevent unnecessary re-sorting
  const sortedPortfolio = useMemo(() => {
    if (!portfolio?.length) return [];

    return [...portfolio].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [portfolio, sortOrder]);

  // Fetch portfolio data with proper error handling
  const fetchPortfolio = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);

    try {
      // Fetch from API
      const data = await getPortfolioEntries();
      if (data && data.length > 0) {
        setPortfolio(data);
      } else {
        console.warn("No portfolio data received from API");
      }
    } catch (err) {
      console.error("Failed to fetch portfolio data:", err);
      // Could show an error toast/notification here
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  // Render portfolio card skeletons during loading
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse"
        >
          <div className="p-6 flex flex-col space-y-4">
            <div className="h-7 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="space-y-3 pt-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex justify-between">
                  <div className="h-5 bg-muted rounded w-1/4"></div>
                  <div className="h-5 bg-muted rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Portfolio History</h1>
        <p className="text-muted-foreground">
          View your complete portfolio history and track changes over time
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="sort-order" className="text-sm font-medium">
            Sort by:
          </label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value as "newest" | "oldest")
            }
            className="rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => fetchPortfolio(true)}
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
                Refresh Data
              </>
            )}
          </button>
          <Link
            href="/add"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Entry
          </Link>
        </div>
      </div>

      {/* Portfolio Cards */}
      {isLoading ? (
        renderSkeletons()
      ) : sortedPortfolio.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card p-8">
          <div className="mb-4 text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-lg font-medium">No portfolio entries found</p>
          </div>
          <p className="text-muted-foreground mb-6">
            Start tracking your crypto assets by adding your first portfolio
            entry.
          </p>
          <Link
            href="/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Your First Entry
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedPortfolio.map((item) => {
            return (
              <Link key={item.createdAt} href={`/portfolio/${item._id}`}>
                <ItemCard item={item} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
