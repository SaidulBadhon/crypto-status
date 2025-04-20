import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import PortfolioDetail from "./pages/PortfolioDetail";
import AddEntry from "./pages/AddEntry";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/portfolio/:id" element={<PortfolioDetail />} />
        <Route path="/add" element={<AddEntry />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
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
