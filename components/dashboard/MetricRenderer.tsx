"use client"

import { MetricConfig } from "@/lib/dashboard/types/MetricConfig"
import ChartCard from "./ChartCard"

interface MetricRendererProps<T = unknown> {
  config: MetricConfig
  data: T
}

export default function MetricRenderer<T = unknown>({
  config,
  data,
}: MetricRendererProps<T>) {
  if (!data) return null

  const Component = config.component.renderer

  // For stat cards, render without ChartCard wrapper
  if (config.component.type === "statCard") {
    return <Component data={data} title={config.title} {...config.componentProps} />
  }

  // For charts, wrap in ChartCard
  return (
    <ChartCard title={config.title} description={config.description}>
      <Component
        data={data}
        {...config.componentProps}
        xAxisFormatter={config.labelFormatters?.xAxis}
        yAxisFormatter={config.labelFormatters?.yAxis}
        tooltipFormatter={config.labelFormatters?.tooltip}
      />
    </ChartCard>
  )
}
