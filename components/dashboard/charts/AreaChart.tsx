"use client"

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent"
import { TooltipProps } from "recharts"
import { TimeSeriesDataPoint } from "@/lib/dashboard/types/MetricConfig"

interface AreaChartProps {
  data: TimeSeriesDataPoint[]
  dataKey?: keyof TimeSeriesDataPoint
  xAxisKey?: keyof TimeSeriesDataPoint
  height?: number
  color?: string
  fillOpacity?: number
  showLegend?: boolean
  xAxisFormatter?: (value: string | number) => string
  yAxisFormatter?: (value: number) => string
  tooltipFormatter?: (
    value: ValueType,
    name: NameType,
    props: TooltipProps<ValueType, NameType>
  ) => string[]
}

export default function AreaChart({
  data,
  dataKey = "value",
  xAxisKey = "label",
  height = 300,
  color = "hsl(var(--primary))",
  fillOpacity = 0.3,
  showLegend = false,
  xAxisFormatter,
  yAxisFormatter,
  tooltipFormatter,
}: AreaChartProps) {
  // ✅ Ensure unique gradient for multiple charts
  const gradientId = `colorValue-${Math.random().toString(36).substring(2, 9)}`

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={fillOpacity} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

        {/* X Axis */}
        <XAxis
          dataKey={xAxisKey as string}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          tickFormatter={xAxisFormatter}
        />

        {/* Y Axis */}
        <YAxis
          domain={["auto", "auto"]}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          tickFormatter={yAxisFormatter}
        />

        {/* Tooltip */}
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
          }}
          formatter={
            tooltipFormatter ??
            ((value, name) => [
              typeof value === "number" ? value.toString() : (value ?? "").toString(),
              name?.toString() ?? "",
            ])
          }
        />

        {/* Optional legend */}
        {showLegend && (
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ color: "hsl(var(--muted-foreground))" }}
          />
        )}

        {/* Main area plot */}
        <Area
          type="monotone"
          dataKey={dataKey as string}
          stroke={color}
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#${gradientId})`}
          animationDuration={800}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}