export interface CryptoItem {
  name: string;
  amount: string;
  amountInUsdt: string;
  parPrice: string;
}

export interface PortfolioItem {
  createdAt: string;
  total: string;
  crypto: CryptoItem[];
  _id?: string;
}

export interface ChartDataPoint {
  name: string;
  date: string;
  value: number;
}

export interface PortfolioStats {
  totalValue: number;
  change24h: number;
  changePercentage: number;
  trend: "up" | "down" | "neutral";
}

export type TransactionType = "buy" | "sell" | "transfer";

export interface Transaction {
  _id?: string;
  type: TransactionType;
  date: string; // ISO date string
  coin: string; // Cryptocurrency symbol (e.g., BTC, ETH)
  amount: string; // Amount of cryptocurrency
  pricePerCoin: string; // Price per coin in USDT
  totalValue: string; // Total value in USDT (amount * pricePerCoin)
  fee: string; // Transaction fee in USDT
  notes?: string; // Optional notes about the transaction
}

export interface TransactionStats {
  totalBuyValue: number;
  totalSellValue: number;
  totalFees: number;
  totalProfit: number;
  profitPercentage: number;
  trend: "profit" | "loss" | "neutral";
}
