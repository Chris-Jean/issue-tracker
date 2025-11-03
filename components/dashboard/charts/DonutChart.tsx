"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { DistributionDataPoint } from "@/lib/dashboard/types/MetricConfig";

type TooltipProps = {
  payload?: { percentage?: number };
};

interface DonutChartProps {
  data: DistributionDataPoint[];
  height?: number;
  colors?: string[];
  innerRadius?: number;
  outerRadius?: number;
  tooltipFormatter?: (
    value: number,
    name: string,
    props: TooltipProps
  ) => string[];
}

const DEFAULT_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function DonutChart({
  data,
  height = 300,
  colors = DEFAULT_COLORS,
  innerRadius = 60,
  outerRadius = 100,
  tooltipFormatter,
}: DonutChartProps) {
  const defaultFormatter = (
    value: number,
    name: string,
    props: TooltipProps
  ): string[] => [
    `${value} (${(props.payload?.percentage ?? 0).toFixed(1)}%)`,
    name,
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percentage }: DistributionDataPoint) =>
            `${name}: ${percentage.toFixed(1)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || colors[index % colors.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
          }}
          formatter={tooltipFormatter ?? defaultFormatter}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => (
            <span className="text-sm text-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
