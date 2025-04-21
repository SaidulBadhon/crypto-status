"use client";

import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { getPortfolioFromJsonBin } from "../api/portfolioApi";
import { getCachedPortfolio, setCache } from "@/lib/cacheHelper";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Image from "@/components/image";
import moment from "moment";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { redirect } from "next/navigation";

export default function PortfolioDetail() {
  const { id } = useParams<any>();
  const getPortfolioFromJsonBin = () => {};

  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioItem, setPortfolioItem] = useState<any>(null);

  const fetchPortfolio = async () => {
    setIsLoading(true);

    const cached = getCachedPortfolio();
    if (cached) {
      setPortfolio(cached);
      setIsLoading(false);
      return;
    }

    try {
      const data = await getPortfolioFromJsonBin();
      setPortfolio(data);
      setCache(data);
    } catch (err) {
      console.error("Failed to fetch from JSONBin:", err);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  useEffect(() => {
    if (portfolio.length > 0 && id) {
      const item = portfolio.find((item) => item.createdAt === id);
      if (item) {
        setPortfolioItem(item);
      } else {
        // If item not found, navigate back to portfolio list
        redirect("/portfolio");
      }
    }
  }, [portfolio, id]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-muted-foreground">Loading portfolio data...</p>
      </div>
    );
  }

  if (!portfolioItem) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Portfolio entry not found.</p>
        <button
          onClick={() => redirect("/portfolio")}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Portfolio
        </button>
      </div>
    );
  }

  // Calculate total value in USDT
  const totalUSDT = portfolioItem.crypto.reduce(
    (sum: number, coin: any) =>
      sum + parseFloat(coin.amountInUsdt.replace(/,/g, "")),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => redirect("/portfolio")}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Portfolio
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Portfolio Details</h1>
        <p className="text-muted-foreground">
          {moment
            .utc(portfolioItem.createdAt)
            .format("MMMM D, YYYY [at] h:mm A")}
        </p>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Summary</CardTitle>
          <CardDescription>Total value and asset distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Total Value</h3>
              <p className="text-3xl font-bold">{portfolioItem.total}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {totalUSDT.toLocaleString()} USDT
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Asset Count</h3>
              <p className="text-3xl font-bold">
                {portfolioItem.crypto.length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Different cryptocurrencies
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets List */}
      <Card>
        <CardHeader>
          <CardTitle>Assets</CardTitle>
          <CardDescription>
            Detailed breakdown of all cryptocurrencies in this portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolioItem.crypto.map((crypto: any) => {
              // Calculate percentage of total portfolio
              const usdtValue = parseFloat(
                crypto.amountInUsdt.replace(/,/g, "")
              );
              const percentage = (usdtValue / totalUSDT) * 100;

              return (
                <div
                  key={crypto.name}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      className="w-10 h-10 !rounded-md"
                      src={`https://assets.parqet.com/logos/crypto/${crypto.name}`}
                      name={crypto.name}
                      alt={crypto.name}
                    />
                    <div>
                      <h3 className="font-medium">{crypto.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {crypto.parPrice}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <p className="font-semibold">{crypto.amount}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {crypto.amountInUsdt} USDT
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
