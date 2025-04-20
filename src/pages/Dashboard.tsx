import { useEffect, useState } from "react";
import CryptoChart from "../components/CryptoChart";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Link } from "react-router-dom";
import { ArrowUpRight, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

// API and cache functions
import { getPortfolioFromJsonBin } from "../api/portfolioApi";
import { getCachedPortfolio, setCache } from "../lib/cacheHelper";

const COIN_OPTIONS = ["Total", "BTC", "ETH", "NEAR", "USDC", "USDT"];

export default function Dashboard() {
  const [selectedCoin, setSelectedCoin] = useState("Total");
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalValue: 0,
    change24h: 0,
    changePercentage: 0,
    trend: "neutral",
  });

  // Get the latest portfolio entry
  const latestEntry = portfolio.length > 0 ? portfolio[portfolio.length - 1] : null;

  const handleSetSelectedData = (coinName: string) => {
    const data = portfolio.map((item) => {
      let value: number;

      if (coinName === "Total") {
        value = parseFloat(item.total.replace(/,/g, "").replace(/[^\d.]/g, ""));
      } else {
        const coin = item.crypto.find((c: any) => c.name === coinName);
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
  };

  const fetchPortfolio = async (forceRefresh = false) => {
    setIsLoading(true);

    if (!forceRefresh) {
      const cached = getCachedPortfolio();
      if (cached) {
        setPortfolio(cached);
        setIsLoading(false);
        return;
      }
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
    if (portfolio.length > 0) {
      handleSetSelectedData(selectedCoin);
    }
  }, [selectedCoin, portfolio]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your crypto portfolio performance
        </p>
      </div>

      {/* Stats Cards */}
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
                ${stats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
              <div className={`text-2xl font-bold ${stats.trend === 'up' ? 'text-green-500' : stats.trend === 'down' ? 'text-red-500' : ''}`}>
                {stats.change24h >= 0 ? '+' : ''}${stats.change24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              {stats.trend === 'up' ? (
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
              <div className={`text-2xl font-bold ${stats.trend === 'up' ? 'text-green-500' : stats.trend === 'down' ? 'text-red-500' : ''}`}>
                {stats.changePercentage >= 0 ? '+' : ''}{stats.changePercentage.toFixed(2)}%
              </div>
              {stats.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={() => fetchPortfolio(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Refresh Data"}
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
      {selectedData.length > 0 && (
        <CryptoChart data={selectedData} coin={selectedCoin} />
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">View your complete portfolio history and detailed breakdown of assets.</p>
            <Link 
              to="/portfolio" 
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
            <p className="mb-4">Record a new portfolio snapshot to track your crypto assets over time.</p>
            <Link 
              to="/add" 
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
