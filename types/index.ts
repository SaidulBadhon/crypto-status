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
  trend: 'up' | 'down' | 'neutral';
}
