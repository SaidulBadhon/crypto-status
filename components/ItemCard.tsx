import moment from "moment";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Image from "./image";

interface CryptoItem {
  name: string;
  amount: string;
  amountInUsdt: string;
  parPrice: string;
}

interface PortfolioItem {
  createdAt: string;
  total: string;
  crypto: CryptoItem[];
}

interface ItemCardProps {
  item: PortfolioItem;
  onCoinClick?: (coin: string) => void;
  className?: string;
}

export default function ItemCard({
  item,
  onCoinClick,
  className = "",
}: ItemCardProps) {
  return (
    <Card className={`w-full hover:shadow-md transition-shadow ${className}`}>
      {/* <Card className="max-w-96 w-full"> */}
      <CardHeader>
        <CardTitle className="text-3xl">{item.total}</CardTitle>
        <CardDescription>
          {moment.utc(item.createdAt).fromNow()}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        {item.crypto.map((crypto) => (
          <div
            key={crypto.name}
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
        ))}
      </CardContent>
    </Card>
  );
}

// import moment from "moment";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "./ui/card";
// import Image from "./image";

// export default function ItemCard({
//   item,
// }: {
//   item: {
//     createdAt: string;
//     total: string;
//     crypto: {
//       name: string;
//       amount: string;
//       amountInUsdt: string;
//       parPrice: string;
//     }[];
//   };
// }) {
//   return (
//     <Card className="max-w-96 w-full">
//       <CardHeader>
//         <CardTitle className="text-3xl">{item.total}</CardTitle>
//         <CardDescription>
//           {moment.utc(item.createdAt).fromNow()}
//         </CardDescription>
//       </CardHeader>

//       <CardContent className="flex flex-col gap-2">
//         {item.crypto.map((crypto) => (
//           <div
//             key={crypto.name}
//             className="border-b flex justify-between pb-2 mb-2"
//           >
//             <div className="flex items-center gap-2">
//               <Image
//                 className="w-8 h-8 !rounded-sm"
//                 src={`https://assets.parqet.com/logos/crypto/${crypto.name}`}
//                 name={crypto.name}
//                 alt="Bitcoin"
//               />

//               <div>
//                 <p className="text-sm font-semibold">{crypto.name}</p>
//                 <p className="text-xs">{crypto.parPrice}</p>
//               </div>
//             </div>

//             <div className="flex flex-col justify-between items-end">
//               <p className="text-lg font-semibold">{crypto.amount}</p>
//               <p className="text-sm">{crypto.amountInUsdt} USDT</p>
//             </div>
//           </div>
//         ))}
//       </CardContent>

//       {/*
// <CardHeader>
// <CardTitle>Card Title</CardTitle>
// <CardDescription>Card Description</CardDescription>
// </CardHeader>
// <CardContent>
// <p>Card Content</p>
// </CardContent>
// <CardFooter>
// <p>Card Footer</p>
// </CardFooter> */}
//     </Card>
//   );
// }
