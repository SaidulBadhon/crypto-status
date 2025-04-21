import moment from "moment";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Image from "./image";
import { CryptoItem, PortfolioItem } from "@/types";
import { memo } from "react";

interface ItemCardProps {
  item: PortfolioItem;
  onCoinClick?: (coin: string) => void;
  className?: string;
}

function ItemCard({ item, onCoinClick, className = "" }: ItemCardProps) {
  return (
    <Card className={`w-full hover:shadow-md transition-shadow ${className}`}>
      <CardHeader>
        <CardTitle className="text-3xl">{item.total}</CardTitle>
        <CardDescription>
          {moment.utc(item.createdAt).fromNow()}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        {item.crypto.map((crypto) => (
          <CryptoListItem
            key={crypto.name}
            crypto={crypto}
            onCoinClick={onCoinClick}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface CryptoListItemProps {
  crypto: CryptoItem;
  onCoinClick?: (coin: string) => void;
}

// Memoize the crypto list items to prevent unnecessary re-renders
const CryptoListItem = memo(({ crypto, onCoinClick }: CryptoListItemProps) => {
  return (
    <div
      className="border-b flex justify-between pb-2 mb-2 rounded px-2 hover:bg-accent/50 transition-colors"
      onClick={onCoinClick ? () => onCoinClick(crypto.name) : undefined}
      style={{ cursor: onCoinClick ? "pointer" : "default" }}
    >
      <div className="flex items-center gap-2">
        <Image
          className="w-8 h-8 !rounded-sm"
          src={`https://assets.parqet.com/logos/crypto/${crypto.name}`}
          name={crypto.name}
          alt={crypto.name}
        />
        <div>
          <p className="text-sm font-semibold">{crypto.name}</p>
          <p className="text-xs">{crypto.parPrice}</p>
        </div>
      </div>

      <div className="flex flex-col justify-between items-end">
        <p className="text-lg font-semibold">{crypto.amount}</p>
        <p className="text-sm">{crypto.amountInUsdt} USDT</p>
      </div>
    </div>
  );
});

// Add display name for better debugging
CryptoListItem.displayName = "CryptoListItem";

// Export memoized component to prevent unnecessary re-renders
export default memo(ItemCard);
