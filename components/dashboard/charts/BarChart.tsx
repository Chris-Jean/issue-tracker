"use client"

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { BarChartDataPoint } from "@/lib/dashboard/types/MetricConfig"

interface BarChartProps {
  data: BarChartDataPoint[]
  dataKey?: string
  nameKey?: string
  height?: number
  color?: string
  xAxisFormatter?: (value: any) => string
  yAxisFormatter?: (value: any) => string
  tooltipFormatter?: (value: any, name: string, props: any) => string[]
}

export default function BarChart({
  data,
  dataKey = 'value',
  nameKey = 'name',
  height = 300,
  color = 'hsl(var(--primary))',
  xAxisFormatter,
  yAxisFormatter,
  tooltipFormatter
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey={nameKey}
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
        <Bar dataKey={dataKey} radius={[8, 8, 0, 0]} fill={color}>
          {data.map((entry, index) => {
            // Use different colors for each bar if no specific color is provided
            const defaultColors = [
              'hsl(var(--chart-1))',
              'hsl(var(--chart-2))',
              'hsl(var(--chart-3))',
              'hsl(var(--chart-4))',
              'hsl(var(--chart-5))',
            ]
            return (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || defaultColors[index % defaultColors.length]}
              />
            )
          })}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
