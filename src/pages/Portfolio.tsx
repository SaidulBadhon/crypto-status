import { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard";
import { getCachedPortfolio, setCache } from "../lib/cacheHelper";
import { getPortfolio } from "../lib/dataSourceHelper";
import { Link } from "react-router-dom";

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const sortedPortfolio = [...portfolio].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

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
      const data = await getPortfolio();
      setPortfolio(data);
      setCache(data);
    } catch (err) {
      console.error("Failed to fetch portfolio data:", err);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

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
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Refresh Data"}
          </button>
          <Link
            to="/add"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            Add New Entry
          </Link>
        </div>
      </div>

      {/* Portfolio Cards */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">
            Loading portfolio data...
          </p>
        </div>
      ) : sortedPortfolio.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No portfolio entries found.</p>
          <Link
            to="/add"
            className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Add Your First Entry
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedPortfolio.map((item) => (
            <Link key={item.createdAt} to={`/portfolio/${item.createdAt}`}>
              <ItemCard item={item} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
