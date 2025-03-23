import { useEffect, useState } from "react";
import ItemCard from "./components/ItemCard";
import CryptoChart from "./components/CryptoChart";

const COIN_OPTIONS = ["Total", "BTC", "ETH", "NEAR", "USDC", "USDT"];

const BIN_ID = import.meta.env.VITE_BIN_ID; // Save this after first POST
const API_KEY = import.meta.env.VITE_BIN_API_KEY;
const LOCAL_STORAGE_KEY = "cryptoPortfolioCache";
const CACHE_EXPIRY_MINUTES = 30;

const getPortfolioFromJsonBin = async () => {
  const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
    headers: {
      "X-Master-Key": API_KEY,
    },
  });

  const result = await res.json();
  return result.record;
};

const isCacheValid = (timestamp: string) => {
  const cacheTime = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - cacheTime.getTime();
  return diffMs < CACHE_EXPIRY_MINUTES * 60 * 1000;
};

const getCachedPortfolio = () => {
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!cached) return null;

  const parsed = JSON.parse(cached);
  return isCacheValid(parsed.timestamp) ? parsed.data : null;
};

const setCache = (data: any) => {
  localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify({
      data,
      timestamp: new Date().toISOString(),
    })
  );
};

export default function App() {
  const [selectedCoin, setSelectedCoin] = useState("Total");
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reversePortfolio = [...portfolio].reverse();

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

  // Save new portfolio item to JSONBin
  const [newEntryText, setNewEntryText] = useState("");
  const [jsonError, setJsonError] = useState("");

  const savePortfolioToJsonBin = async (newItem: any) => {
    try {
      const updatedData = [...portfolio, newItem];

      const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY,
        },
        body: JSON.stringify(updatedData),
      });

      const result = await res.json();
      setPortfolio(updatedData);
      setCache(updatedData);
      alert("New portfolio entry added!");
      setNewEntryText(""); // Clear textarea
      setJsonError(""); // Clear errors
    } catch (err) {
      console.error("Failed to save to JSONBin:", err);
      alert("Error saving portfolio data.");
    }
  };

  return (
    <div className="bg-slate-50 p-8 gap-4 flex flex-col">
      <h1 className="text-4xl font-bold text-center">Crypto Portfolio</h1>
      <div className="flex justify-center mb-4">
        <button
          onClick={() => fetchPortfolio(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Refresh Data
        </button>
      </div>
      <div className="flex flex-wrap gap-4 justify-center">
        {COIN_OPTIONS.map((coin) => (
          <button
            key={coin}
            className={`px-4 py-2 rounded text-white font-medium ${
              selectedCoin === coin ? "bg-black" : "bg-gray-700"
            }`}
            onClick={() => setSelectedCoin(coin)}
          >
            {coin}
          </button>
        ))}
      </div>
      {selectedData.length > 0 && (
        <CryptoChart data={selectedData} coin={selectedCoin} />
      )}
      <div className="grid flex-wrap w-full gap-4 grid-cols-4">
        {reversePortfolio?.map((item) => (
          <ItemCard
            key={item.createdAt}
            item={item}
            onCoinClick={(coin) => setSelectedCoin(coin)}
          />
        ))}
      </div>
      ------------------------------
      <div className="bg-white p-4 rounded shadow max-w-3xl mx-auto flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Add Portfolio JSON</h2>
        <textarea
          className="w-full h-40 p-2 border rounded font-mono text-sm"
          placeholder="Paste new portfolio object here..."
          value={newEntryText}
          onChange={(e) => setNewEntryText(e.target.value)}
        />
        {jsonError && <p className="text-red-600 text-sm">{jsonError}</p>}
        <button
          className="bg-green-600 text-white px-4 py-2 rounded self-start"
          onClick={() => {
            try {
              const parsed = JSON.parse(newEntryText);
              if (!parsed.createdAt || !parsed.total || !parsed.crypto) {
                throw new Error(
                  "Missing required fields: total, createdAt, crypto"
                );
              }
              savePortfolioToJsonBin(parsed);
            } catch (err: any) {
              setJsonError(err.message || "Invalid JSON format");
            }
          }}
        >
          Add Entry
        </button>
      </div>
    </div>
  );
}

// import ItemCard from "./components/ItemCard";
// import CryptoChart from "./components/CryptoChart";
// import portfolio from "./data/portfolio.json";
// import { useEffect, useState } from "react";

// const COIN_OPTIONS = ["Total", "BTC", "ETH", "NEAR", "USDC", "USDT"]; // Add more as needed

// export default function App() {
//   const [selectedCoin, setSelectedCoin] = useState("Total");
//   const [selectedData, setSelectedData] = useState<any[]>([]);

//   const reversePortfolio = [...portfolio].reverse();

//   const handleSetSelectedData = (coinName: string) => {
//     const data = portfolio.map((item) => {
//       let value: number;

//       if (coinName === "Total") {
//         value = parseFloat(item.total.replace(/,/g, "").replace(/[^\d.]/g, ""));
//       } else {
//         const coin = item.crypto.find((c) => c.name === coinName);
//         // value = coin ? parseFloat(coin.amountInUsdt) : 0;
//         value = coin ? parseFloat(coin.amount) : 0;
//       }

//       return {
//         name: coinName,
//         date: item.createdAt,
//         value,
//       };
//     });

//     setSelectedData(data);
//   };

//   useEffect(() => {
//     handleSetSelectedData(selectedCoin);
//   }, [selectedCoin]);

//   return (
//     <div className="bg-slate-50 p-8 gap-4 flex flex-col">
//       <h1 className="text-4xl font-bold text-center">Crypto Portfolio</h1>

//       {/* Selector buttons */}
//       <div className="flex flex-wrap gap-4 justify-center">
//         {COIN_OPTIONS.map((coin) => (
//           <button
//             key={coin}
//             className={`px-4 py-2 rounded text-white font-medium ${
//               selectedCoin === coin ? "bg-black" : "bg-gray-700"
//             }`}
//             onClick={() => setSelectedCoin(coin)}
//           >
//             {coin}
//           </button>
//         ))}
//       </div>

//       {/* Chart */}
//       {selectedData.length > 0 && (
//         <CryptoChart data={selectedData} coin={selectedCoin} />
//       )}

//       {/* Cards */}
//       <div className="grid flex-wrap w-full gap-4 grid-cols-4">
//         {reversePortfolio?.map((item) => (
//           <ItemCard
//             key={item.createdAt}
//             item={item}
//             onCoinClick={(coin) => setSelectedCoin(coin)}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// // import ItemCard from "./components/ItemCard";
// // import CryptoChart from "./components/CryptoChart";
// // import portfolio from "./data/portfolio.json"; // Adjust the path accordingly
// // import { useEffect, useState } from "react";

// // export default function App() {
// //   console.log("portfolio", portfolio);

// //   const [selectedData, setSelectedData] = useState<any>();

// //   const handleSetSelectedData = () => {
// //     setSelectedData(
// //       portfolio.map((item) => {
// //         const total = item.total;
// //         const totalNumber = parseFloat(
// //           total.replace(/,/g, "").replace(/[^\d.]/g, "")
// //         );

// //         console.log("item", totalNumber);

// //         return {
// //           name: "total",
// //           date: item.createdAt,
// //           value: totalNumber,
// //         };
// //       })
// //     );
// //   };

// //   useEffect(() => {
// //     handleSetSelectedData();
// //   }, []);

// //   return (
// //     <div className="bg-red-300 p-8 gap-4 flex flex-col">
// //       <h1 className="text-4xl text-center">Hello, World!</h1>

// //       {selectedData && <CryptoChart data={selectedData} />}

// //       <div className="flex flex-wrap w-full gap-4 ">
// //         {portfolio?.map((item) => (
// //           <ItemCard key={item.createdAt} item={item} />
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }
