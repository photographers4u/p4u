"use client";

import * as Recharts from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

export type DonutChartSlice = {
  key: string;
  label: string;
  value: number;
  color: string;
};

export function DonutChart({ data }: { data: DonutChartSlice[] }) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);
  const config: ChartConfig = Object.fromEntries(
    data.map((slice) => [slice.key, { label: slice.label, color: slice.color }]),
  );

  if (total === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No data yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <ChartContainer config={config} className="mx-auto h-40 w-40 shrink-0 aspect-square">
        <Recharts.PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Recharts.Pie
            data={data}
            dataKey="value"
            nameKey="key"
            innerRadius="62%"
            outerRadius="100%"
            strokeWidth={2}
            stroke="var(--card)"
          >
            {data.map((slice) => (
              <Recharts.Cell key={slice.key} fill={slice.color} />
            ))}
          </Recharts.Pie>
        </Recharts.PieChart>
      </ChartContainer>

      <ul className="flex-1 space-y-2">
        {data.map((slice) => (
          <li
            key={slice.key}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: slice.color }}
              />
              <span className="truncate text-foreground">{slice.label}</span>
            </span>
            <span className="shrink-0 font-mono tabular-nums text-muted-foreground">
              {slice.value.toLocaleString()} ·{" "}
              {Math.round((slice.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
