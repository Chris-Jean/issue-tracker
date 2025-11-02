"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useMemo } from "react"
import { MetricEngine } from "@/lib/dashboard/core/MetricEngine"
import { metricsConfig } from "@/lib/dashboard/config/metrics.config"
import MetricRenderer from "@/components/dashboard/MetricRenderer"
import ThemeToggle from "@/components/ui/ThemeToggle"

export default function DashboardPage() {
  const issues = useQuery(api.issues.getIssues)

  // Process all metrics
  const metricsData = useMemo(() => {
    if (!issues) return null

    const engine = new MetricEngine()
    return engine.processMetrics(metricsConfig, issues)
  }, [issues])

  if (issues === undefined || metricsData === null) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <ThemeToggle />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-lg p-6 shadow-sm animate-pulse"
            >
              <div className="h-24 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-[1400px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into issue tracking metrics
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Volume Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {metricsConfig.slice(0, 4).map(config => {
          const data = metricsData.get(config.id)
          if (!data) return null

          return (
            <MetricRenderer
              key={config.id}
              config={config}
              data={data}
            />
          )
        })}
      </div>

      {/* Volume Trend - Full Width */}
      <div className="mb-6">
        {(() => {
          const config = metricsConfig[4]
          const data = metricsData.get(config.id)
          if (!data) return null

          return (
            <MetricRenderer
              key={config.id}
              config={config}
              data={data}
            />
          )
        })()}
      </div>

      {/* Category Distribution and Reason Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {metricsConfig.slice(5, 6).map(config => {
          const data = metricsData.get(config.id)
          if (!data) return null

          return (
            <MetricRenderer
              key={config.id}
              config={config}
              data={data}
            />
          )
        })}
        {metricsConfig.slice(9, 10).map(config => {
          const data = metricsData.get(config.id)
          if (!data) return null

          return (
            <MetricRenderer
              key={config.id}
              config={config}
              data={data}
            />
          )
        })}
      </div>

      {/* Top Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metricsConfig.slice(6, 9).map(config => {
          const data = metricsData.get(config.id)
          if (!data) return null

          return (
            <MetricRenderer
              key={config.id}
              config={config}
              data={data}
            />
          )
        })}
      </div>
    </div>
  )
}
