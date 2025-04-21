"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
import { ChartDataPoint } from "@/types";
import { memo, useMemo } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

/**
 * Calculate the Y-axis domain with a buffer for better visualization
 * @param data Chart data points
 * @returns Y-axis domain as [min, max]
 */
function getYAxisDomain(data: ChartDataPoint[]): [number, number] {
  if (!data.length) return [0, 100];

  const values = data.map((item) => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Add 10% padding on both sides for better visualization
  const buffer = (max - min) * 0.1;

  return [min - buffer, max + buffer];
}

/**
 * Calculate the trend between first and last data points
 * @param data Chart data points
 * @returns Object with trend direction and percentage change
 */
function calculateTrend(data: ChartDataPoint[]): {
  direction: "up" | "down" | "neutral";
  percentage: number;
} {
  if (data.length < 2) return { direction: "neutral", percentage: 0 };

  const firstValue = data[0].value;
  const lastValue = data[data.length - 1].value;
  const change = lastValue - firstValue;
  const percentage = (change / firstValue) * 100;

  return {
    direction: change > 0 ? "up" : change < 0 ? "down" : "neutral",
    percentage: Math.abs(percentage),
  };
}

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface CryptoChartProps {
  data: ChartDataPoint[];
  coin: string;
}

function CryptoChart({ data: chartData, coin }: CryptoChartProps) {
  // Memoize calculations to prevent recalculation on re-renders
  const yAxisDomain = useMemo(() => getYAxisDomain(chartData), [chartData]);
  const trend = useMemo(() => calculateTrend(chartData), [chartData]);

  // Format dates for display
  const startDate =
    chartData.length > 0 ? moment(chartData[0].date).format("MMM D") : "";
  const endDate =
    chartData.length > 0
      ? moment(chartData[chartData.length - 1].date).format("MMM D")
      : "";

  // Handle empty data gracefully
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
          <CardDescription>
            There is no data to display for this time period
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">
            Add portfolio entries to see chart data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {coin === "Total" ? "Portfolio Value" : `${coin} Value`} Over Time
        </CardTitle>
        <CardDescription>
          Showing data from {startDate} to {endDate}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ChartContainer className="h-full w-full" config={chartConfig}>
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
                <Tooltip
                  formatter={(value: number) => [
                    value.toFixed(8).replace(/\.?0+$/, ""),
                    coin === "Total" ? "Value" : coin,
                  ]}
                  labelFormatter={(label) =>
                    moment(label).format("MMM D, YYYY")
                  }
                />
                <ChartTooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      formatter={(value: any) => {
                        // Format the value based on the coin type
                        const num = Number(value);
                        if (isNaN(num)) return value;

                        // For BTC and other cryptocurrencies, show more decimal places
                        if (
                          coin !== "Total" &&
                          coin !== "USDT" &&
                          coin !== "USDC"
                        ) {
                          return num.toFixed(8).replace(/\.?0+$/, "");
                        }

                        // For dollar values, show 2 decimal places
                        return num.toFixed(2);
                      }}
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
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {trend.direction !== "neutral" && (
                <>
                  {trend.direction === "up" ? (
                    <>
                      Trending up by {trend.percentage.toFixed(2)}%
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </>
                  ) : (
                    <>
                      Trending down by {trend.percentage.toFixed(2)}%
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    </>
                  )}
                </>
              )}
              {trend.direction === "neutral" && (
                <>
                  No significant change in{" "}
                  {coin === "Total" ? "portfolio value" : coin}
                </>
              )}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              From {startDate} to {endDate}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

// Export memoized component to prevent unnecessary re-renders
export default memo(CryptoChart);
