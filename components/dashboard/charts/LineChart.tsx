"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TimeSeriesDataPoint } from "@/lib/dashboard/types/MetricConfig";

// Define safe types for formatter functions
interface TooltipProps {
  payload?: Record<string, unknown>;
  label?: string;
}

interface LineChartProps {
  data: TimeSeriesDataPoint[];
  dataKey?: string;
  xAxisKey?: string;
  height?: number;
  color?: string;
  xAxisFormatter?: (value: string | number) => string;
  yAxisFormatter?: (value: string | number) => string;
  tooltipFormatter?: (
    value: string | number,
    name: string,
    props: TooltipProps
  ) => string[];
}

export default function LineChart({
  data,
  dataKey = "value",
  xAxisKey = "label",
  height = 300,
  color = "hsl(var(--primary))",
  xAxisFormatter,
  yAxisFormatter,
  tooltipFormatter,
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          tickFormatter={xAxisFormatter}
        />
        <YAxis
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          tickFormatter={yAxisFormatter}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
          }}
          formatter={tooltipFormatter}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
