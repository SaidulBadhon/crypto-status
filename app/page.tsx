"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import CryptoChart from "../components/CryptoChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  RefreshCw,
} from "lucide-react";

// API and cache functions
import { getPortfolioFromJsonBin } from "@/lib/api";
import { getCachedPortfolio, setCache } from "@/lib/cacheHelper";
import Link from "next/link";
import { ChartDataPoint, PortfolioItem, PortfolioStats } from "@/types";

// Define available coin options
const COIN_OPTIONS = ["Total", "BTC", "ETH", "NEAR", "USDC", "USDT"];

export default function Dashboard() {
  const [selectedCoin, setSelectedCoin] = useState("Total");
  const [selectedData, setSelectedData] = useState<ChartDataPoint[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<PortfolioStats>({
    totalValue: 0,
    change24h: 0,
    changePercentage: 0,
    trend: "neutral",
  });

  // Get the latest portfolio entry
  const latestEntry = useMemo(
    () => (portfolio?.length > 0 ? portfolio[portfolio.length - 1] : null),
    [portfolio]
  );

  // Process data for selected coin
  const handleSetSelectedData = useCallback(
    (coinName: string) => {
      if (!portfolio.length) return;

      const data = portfolio.map((item) => {
        let value: number;

        if (coinName === "Total") {
          // Parse total value, removing commas and non-numeric characters
          value = parseFloat(
            item.total.replace(/,/g, "").replace(/[^\d.]/g, "")
          );
        } else {
          // Find the specific coin in the portfolio
          const coin = item.crypto.find((c) => c.name === coinName);
          value = coin ? parseFloat(coin.amount) : 0;
        }

        return {
          name: coinName,
          date: item.createdAt,
          value,
        };
      });

      setSelectedData(data);

      // Calculate stats if we have enough data
      if (data.length >= 2) {
        const currentValue = data[data.length - 1].value;
        const previousValue = data[data.length - 2].value;
        const change = currentValue - previousValue;
        const changePercentage = (change / previousValue) * 100;

        setStats({
          totalValue: currentValue,
          change24h: change,
          changePercentage,
          trend: change >= 0 ? "up" : "down",
        });
      }
    },
    [portfolio]
  );

  // Fetch portfolio data
  const fetchPortfolio = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);

    try {
      // Try to get from cache first if not forcing refresh
      if (!forceRefresh) {
        const cached = getCachedPortfolio();
        if (cached && cached.length > 0) {
          setPortfolio(cached);
          setIsLoading(false);
          return;
        }
      }

      // Fetch from API if cache is invalid or forcing refresh
      const data = await getPortfolioFromJsonBin();
      if (data && data.length > 0) {
        setPortfolio(data);
        setCache(data);
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

  // Update selected data when coin or portfolio changes
  useEffect(() => {
    if (portfolio?.length > 0) {
      handleSetSelectedData(selectedCoin);
    }
  }, [selectedCoin, portfolio, handleSetSelectedData]);

  // Loading skeleton for stats cards
  const renderStatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="h-4 bg-muted rounded w-24"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-muted rounded w-32"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your crypto portfolio performance
        </p>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        renderStatsSkeleton()
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  $
                  {stats.totalValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </div>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                24h Change
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div
                  className={`text-2xl font-bold ${
                    stats.trend === "up"
                      ? "text-green-500"
                      : stats.trend === "down"
                      ? "text-red-500"
                      : ""
                  }`}
                >
                  {stats.change24h >= 0 ? "+" : "-"}$
                  {Math.abs(stats.change24h).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </div>
                {stats.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Percentage Change
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div
                  className={`text-2xl font-bold ${
                    stats.trend === "up"
                      ? "text-green-500"
                      : stats.trend === "down"
                      ? "text-red-500"
                      : ""
                  }`}
                >
                  {stats.changePercentage >= 0 ? "+" : ""}
                  {stats.changePercentage.toFixed(2)}%
                </div>
                {stats.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-end">
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
      </div>

      {/* Coin Selection */}
      <div className="flex flex-wrap gap-2 justify-center">
        {COIN_OPTIONS.map((coin) => (
          <button
            key={coin}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedCoin === coin
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
            onClick={() => setSelectedCoin(coin)}
          >
            {coin}
          </button>
        ))}
      </div>

      {/* Chart */}
      {isLoading ? (
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-48 mb-2"></div>
            <div className="h-4 bg-muted rounded w-64"></div>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center">
            <div className="h-full w-full bg-muted/30 rounded-md animate-pulse"></div>
          </CardContent>
        </Card>
      ) : selectedData.length > 0 ? (
        <CryptoChart data={selectedData} coin={selectedCoin} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>There is no data to display</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">
              Add portfolio entries to see chart data
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              View your complete portfolio history and detailed breakdown of
              assets.
            </p>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              View Portfolio <ArrowUpRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add New Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Record a new portfolio snapshot to track your crypto assets over
              time.
            </p>
            <Link
              href="/add"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              Add Entry <ArrowUpRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
