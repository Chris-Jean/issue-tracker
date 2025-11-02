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

interface HorizontalBarChartProps {
  data: BarChartDataPoint[]
  dataKey?: string
  nameKey?: string
  height?: number
  color?: string
  xAxisFormatter?: (value: any) => string
  yAxisFormatter?: (value: any) => string
  tooltipFormatter?: (value: any, name: string, props: any) => string[]
}

export default function HorizontalBarChart({
  data,
  dataKey = 'value',
  nameKey = 'name',
  height = 400,
  color = 'hsl(var(--primary))',
  xAxisFormatter,
  yAxisFormatter,
  tooltipFormatter
}: HorizontalBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          type="number"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          tickFormatter={xAxisFormatter}
        />
        <YAxis
          type="category"
          dataKey={nameKey}
          width={150}
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
        <Bar dataKey={dataKey} radius={[0, 8, 8, 0]} fill={color}>
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
