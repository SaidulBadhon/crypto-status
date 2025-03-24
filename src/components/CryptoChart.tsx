"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import moment from "moment";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

// Utility function for chart Y-axis
// function getYAxisDomain(data: any) {
//   const values = data.map((item: any) => parseFloat(item.value));
//   const min = Math.min(...values);
//   const max = Math.max(...values);

//   const roundedMin = Math.floor(min / 100) * 100;
//   const roundedMax = Math.ceil(max / 100) * 100;

//   return [roundedMin, roundedMax];
// }
function getYAxisDomain(data: any) {
  const values = data.map((item: any) => parseFloat(item.value));
  const min = Math.min(...values);
  const max = Math.max(...values);

  const buffer = (max - min) * 0.1; // 10% padding on both sides

  return [min - buffer, max + buffer];
}

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function CryptoChart({
  data: chartData,
  coin,
}: {
  data: any;
  coin: string;
}) {
  const yAxisDomain = getYAxisDomain(chartData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {coin === "total" ? "Portfolio Value" : `${coin} Value`} Over Time
        </CardTitle>
        <CardDescription>
          Showing data from {moment(chartData[0].date).format("MMM D")} to{" "}
          {moment(chartData[chartData.length - 1].date).format("MMM D")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-[400px] w-full" config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 40, left: 40, right: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => moment(value).format("MMM D")}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={yAxisDomain}
              tickFormatter={(value) => value.toFixed(2)}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value: any) => Number(value)?.toFixed(20)}
                  // valueFormatter={(value: number) => value.toFixed(8)} // or use dynamic based on coin
                />
              }
            />
            <Area
              dataKey="value"
              type="monotone"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.4}
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up or down depends on{" "}
              {coin === "total" ? "portfolio value" : coin}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              From {moment(chartData[0].date).format("MMM D")} to{" "}
              {moment(chartData[chartData.length - 1].date).format("MMM D")}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

// "use client";

// import { TrendingUp } from "lucide-react";
// import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart";
// import moment from "moment";

// const chartConfig = {
//   value: {
//     label: "Value",
//     color: "hsl(var(--chart-1))",
//   },
// } satisfies ChartConfig;

// function getYAxisDomain(data: any) {
//   const values = data.map((item: any) => parseFloat(item.value));
//   const min = Math.min(...values);
//   const max = Math.max(...values);

//   const roundedMin = Math.floor(min / 100) * 100;
//   const roundedMax = Math.ceil(max / 100) * 100;

//   return [roundedMin, roundedMax];
// }

// export default function App({ data: chartData }: { data: any }) {
//   const yAxisDomain = getYAxisDomain(chartData);

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Area Chart</CardTitle>
//         <CardDescription>
//           Showing total visitors for the last 6 months
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <ChartContainer className="h-[400px] w-full" config={chartConfig}>
//           <AreaChart
//             accessibilityLayer
//             data={chartData}
//             margin={{ top: 40, left: 40, right: 20, bottom: 30 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" vertical={false} />
//             <XAxis
//               dataKey="date"
//               tickLine={false}
//               axisLine={false}
//               tickMargin={8}
//               tickFormatter={(value) => moment(value).format("MMM YYYY")}
//             />
//             <YAxis
//               tickLine={false}
//               axisLine={false}
//               tickMargin={8}
//               domain={yAxisDomain}
//             />
//             <ChartTooltip
//               cursor={{ strokeDasharray: "3 3" }}
//               content={<ChartTooltipContent indicator="line" />}
//             />
//             <Area
//               dataKey="value"
//               type="monotone"
//               fill="hsl(var(--chart-1))"
//               fillOpacity={0.4}
//               stroke="hsl(var(--chart-1))"
//               strokeWidth={2}
//             />
//           </AreaChart>
//         </ChartContainer>
//       </CardContent>
//       <CardFooter>
//         <div className="flex w-full items-start gap-2 text-sm">
//           <div className="grid gap-2">
//             <div className="flex items-center gap-2 font-medium leading-none">
//               Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
//             </div>
//             <div className="flex items-center gap-2 leading-none text-muted-foreground">
//               January - June 2024
//             </div>
//           </div>
//         </div>
//       </CardFooter>
//     </Card>
//   );
// }
