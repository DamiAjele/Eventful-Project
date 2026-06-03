'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { RevenueDataPoint } from "@/types/analytics";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

interface Props {
  data: RevenueDataPoint[];
}

export function RevenueChart({ data }: Props) {
  // Use mock data if empty
  const displayData = data.length > 0 ? data : [
    { period: "Mon", revenue: 4000 },
    { period: "Tue", revenue: 3000 },
    { period: "Wed", revenue: 5000 },
    { period: "Thu", revenue: 2780 },
    { period: "Fri", revenue: 1890 },
    { period: "Sat", revenue: 2390 },
    { period: "Sun", revenue: 3490 },
  ];

  return (
    <ChartContainer config={chartConfig} className="w-full h-[300px]">
      <AreaChart
        accessibilityLayer
        data={displayData}
        margin={{
          left: -20,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
        <XAxis
          dataKey="period"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 10, fontWeight: 700 }}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 10, fontWeight: 700 }}
          tickFormatter={(value) => `$${value}`}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <defs>
          <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-primary)"
              stopOpacity={0.2}
            />
            <stop
              offset="95%"
              stopColor="var(--color-primary)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <Area
          dataKey="revenue"
          type="natural"
          fill="url(#fillRevenue)"
          fillOpacity={0.4}
          stroke="var(--color-primary)"
          strokeWidth={3}
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}
