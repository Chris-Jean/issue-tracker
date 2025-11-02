"use client"

import { ArrowUp, ArrowDown, Minus } from "lucide-react"
import { StatCardData } from "@/lib/dashboard/types/MetricConfig"

interface StatCardProps {
  data: StatCardData
  title?: string
}

export default function StatCard({ data, title }: StatCardProps) {
  const getTrendIcon = () => {
    if (!data.trend) return null

    switch (data.trend.direction) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-500" />
      case 'neutral':
        return <Minus className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getTrendColor = () => {
    if (!data.trend) return ''

    switch (data.trend.direction) {
      case 'up':
        return 'text-green-500'
      case 'down':
        return 'text-red-500'
      case 'neutral':
        return 'text-muted-foreground'
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      {title && (
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          {title}
        </h3>
      )}

      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-4xl font-bold text-foreground">{data.value}</p>
          <p className="text-sm text-muted-foreground mt-1">{data.label}</p>
        </div>

        {data.trend && (
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {data.trend.value.toFixed(1)}%
            </span>
            {data.trend.label && (
              <span className="text-xs text-muted-foreground ml-1">
                {data.trend.label}
              </span>
            )}
          </div>
        )}
      </div>

      {data.subValue && (
        <p className="text-xs text-muted-foreground mt-2">{data.subValue}</p>
      )}
    </div>
  )
}
