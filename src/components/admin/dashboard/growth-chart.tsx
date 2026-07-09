"use client";

import * as Recharts from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export type GrowthChartPoint = {
  date: string;
  count: number;
};

const tickFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
});

export function GrowthChart({
  data,
  dataKey,
  label,
  color,
}: {
  data: GrowthChartPoint[];
  dataKey: string;
  label: string;
  color: string;
}) {
  const config: ChartConfig = {
    [dataKey]: { label, color },
  };

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        No signups in this range yet
      </div>
    );
  }

  return (
    <ChartContainer config={config} className="h-56 w-full">
      <Recharts.AreaChart
        data={data}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.28} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <Recharts.CartesianGrid vertical={false} strokeDasharray="3 3" />
        <Recharts.XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tickFormatter={(value: string) =>
            tickFormatter.format(new Date(value))
          }
        />
        <Recharts.YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={32}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                tickFormatter.format(new Date(String(value)))
              }
            />
          }
        />
        <Recharts.Area
          dataKey={dataKey}
          type="monotone"
          stroke={color}
          strokeWidth={2}
          fill={`url(#fill-${dataKey})`}
        />
      </Recharts.AreaChart>
    </ChartContainer>
  );
}
