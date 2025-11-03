"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import { DistributionDataPoint } from "@/lib/dashboard/types/MetricConfig"

interface DonutChartProps {
  data: DistributionDataPoint[]
  height?: number
  colors?: string[]
  innerRadius?: number
  outerRadius?: number
  tooltipFormatter?: (value: any, name: string, props: any) => string[]
}

const DEFAULT_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export default function DonutChart({
  data,
  height = 300,
  colors = DEFAULT_COLORS,
  innerRadius = 60,
  outerRadius = 100,
  tooltipFormatter
}: DonutChartProps) {
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
          label={(props) => {
            const { name, percentage } = props as unknown as { name: string; percentage: number };
            return `${name}: ${percentage.toFixed(1)}%`;
          }}          
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
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--foreground))'
          }}
          formatter={tooltipFormatter || ((value: any, name: string, props: any) => [
            `${value} (${props.payload.percentage.toFixed(1)}%)`,
            name
          ])}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
