"use client"

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { TimeSeriesDataPoint } from "@/lib/dashboard/types/MetricConfig"

interface AreaChartProps {
  data: TimeSeriesDataPoint[]
  dataKey?: string
  xAxisKey?: string
  height?: number
  color?: string
  fillOpacity?: number
  xAxisFormatter?: (value: any) => string
  yAxisFormatter?: (value: any) => string
  tooltipFormatter?: (value: any, name: string, props: any) => string[]
}

export default function AreaChart({
  data,
  dataKey = 'value',
  xAxisKey = 'label',
  height = 300,
  color = 'hsl(var(--primary))',
  fillOpacity = 0.3,
  xAxisFormatter,
  yAxisFormatter,
  tooltipFormatter
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={fillOpacity} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          tickFormatter={xAxisFormatter}
        />
        <YAxis
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          tickFormatter={yAxisFormatter}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--foreground))'
          }}
          formatter={tooltipFormatter}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorValue)"
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}
