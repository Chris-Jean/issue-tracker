import { MetricConfig } from "../types/MetricConfig"
import StatCard from "@/components/dashboard/charts/StatCard"
import BarChart from "@/components/dashboard/charts/BarChart"
import HorizontalBarChart from "@/components/dashboard/charts/HorizontalBarChart"
import DonutChart from "@/components/dashboard/charts/DonutChart"
import AreaChart from "@/components/dashboard/charts/AreaChart"

// Helper types for formatter callbacks
type TooltipProps = {
  payload: Record<string, unknown>
}

export const metricsConfig: MetricConfig[] = [
  // ============================================
  // METRIC 1: Total Issues
  // ============================================
  {
    id: "total-issues",
    title: "Total Issues",
    description: "Total number of active issues",
    category: "volume",
    dataSource: { type: "volume" },
    transforms: [
      {
        type: "custom",
        fn: (data: { total: number }) => ({
          value: data.total,
          label: "Total Active Issues",
        }),
      },
    ],
    component: { type: "statCard", renderer: StatCard },
    layout: { order: 1 },
  },

  // ============================================
  // METRIC 2: Today's Issues
  // ============================================
  {
    id: "today-issues",
    title: "Today",
    category: "volume",
    dataSource: { type: "volume" },
    transforms: [
      {
        type: "custom",
        fn: (
          data: { today: number },
          _params: unknown,
          context?: { metrics?: Record<string, { value: number }[]> }
        ) => {
          const trendData = context?.metrics?.["volume-trend"]
          const avgDaily =
            trendData?.reduce((sum, d) => sum + d.value, 0) /
              (trendData?.length || 1) || 0

          const change =
            avgDaily > 0 ? ((data.today - avgDaily) / avgDaily) * 100 : 0

          return {
            value: data.today,
            label: "Issues Today",
            trend: {
              value: Math.abs(change),
              direction: change > 0 ? "up" : change < 0 ? "down" : "neutral",
              label: "vs daily avg",
            },
          }
        },
      },
    ],
    component: { type: "statCard", renderer: StatCard },
    layout: { order: 2 },
    dependencies: ["volume-trend"],
  },

  // ============================================
  // METRIC 3: This Week
  // ============================================
  {
    id: "week-issues",
    title: "This Week",
    category: "volume",
    dataSource: { type: "volume" },
    transforms: [
      {
        type: "custom",
        fn: (data: { thisWeek: number }) => ({
          value: data.thisWeek,
          label: "Issues This Week",
        }),
      },
    ],
    component: { type: "statCard", renderer: StatCard },
    layout: { order: 3 },
  },

  // ============================================
  // METRIC 4: This Month
  // ============================================
  {
    id: "month-issues",
    title: "This Month",
    category: "volume",
    dataSource: { type: "volume" },
    transforms: [
      {
        type: "custom",
        fn: (data: { thisMonth: number }) => ({
          value: data.thisMonth,
          label: "Issues This Month",
        }),
      },
    ],
    component: { type: "statCard", renderer: StatCard },
    layout: { order: 4 },
  },

  // ============================================
  // METRIC 5: Volume Trend (30 days)
  // ============================================
  {
    id: "volume-trend",
    title: "Issue Creation Trend",
    description: "Daily issue count over the last 30 days",
    category: "trend",
    dataSource: {
      type: "timeSeries",
      params: { field: "dateOfIncident", days: 30, groupBy: "day" },
    },
    labelFormatters: {
      xAxis: (value: string) => value,
      yAxis: (value: number) => value.toString(),
      tooltip: (value: number, _name: string, props: TooltipProps) => [
        `${value} issues`,
        String(props.payload?.label ?? ""),
      ],
    },
    component: { type: "areaChart", renderer: AreaChart },
    componentProps: {
      height: 300,
      dataKey: "value",
      xAxisKey: "label",
      color: "hsl(var(--primary))",
      fillOpacity: 0.3,
    },
    layout: { order: 5 },
  },

  // ============================================
  // METRIC 6: Category Distribution
  // ============================================
  {
    id: "category-distribution",
    title: "Category Distribution",
    description: "Distribution of issues by category",
    category: "distribution",
    dataSource: { type: "distribution", params: { field: "category" } },
    labelFormatters: {
      tooltip: (value: number, name: string, props: TooltipProps) => [
        `${value} issues (${Number(
          props.payload?.percentage ?? 0
        ).toFixed(1)}%)`,
        name,
      ],
    },
    component: { type: "donutChart", renderer: DonutChart },
    componentProps: { height: 300 },
    layout: { order: 6 },
  },

  // ============================================
  // METRIC 7: Top Service Numbers
  // ============================================
  {
    id: "top-service-numbers",
    title: "Top 10 Service Numbers",
    description: "Service numbers with most issues",
    category: "distribution",
    dataSource: { type: "topN", params: { field: "agent", n: 10 } },
    transforms: [
      {
        type: "custom",
        fn: (data: Array<{ name: string; count: number; percentage: number }>) =>
          data.map((item) => ({
            name: item.name,
            value: item.count,
            percentage: item.percentage,
          })),
      },
    ],
    labelFormatters: {
      yAxis: (value: string) => value,
      xAxis: (value: number) => value.toString(),
      tooltip: (value: number, _name: string, props: TooltipProps) => [
        `${value} issues (${Number(
          props.payload?.percentage ?? 0
        ).toFixed(1)}%)`,
        `Service #: ${String(props.payload?.name ?? "")}`,
      ],
    },
    component: { type: "horizontalBarChart", renderer: HorizontalBarChart },
    componentProps: {
      height: 400,
      dataKey: "value",
      nameKey: "name",
      color: "hsl(var(--chart-1))",
    },
    layout: { order: 7 },
  },

  // ============================================
  // METRIC 8: Top Clients
  // ============================================
  {
    id: "top-clients",
    title: "Top 10 Clients",
    description: "Clients with most issues",
    category: "distribution",
    dataSource: { type: "topN", params: { field: "userType", n: 10 } },
    transforms: [
      {
        type: "custom",
        fn: (data: Array<{ name: string; count: number; percentage: number }>) =>
          data.map((item) => ({
            name:
              item.name.length > 30
                ? `${item.name.slice(0, 27)}...`
                : item.name,
            value: item.count,
            fullName: item.name,
            percentage: item.percentage,
          })),
      },
    ],
    labelFormatters: {
      yAxis: (value: string) => value,
      xAxis: (value: number) => value.toString(),
      tooltip: (value: number, _name: string, props: TooltipProps) => [
        `${value} issues (${Number(
          props.payload?.percentage ?? 0
        ).toFixed(1)}%)`,
        String(props.payload?.fullName ?? ""),
      ],
    },
    component: { type: "horizontalBarChart", renderer: HorizontalBarChart },
    componentProps: {
      height: 400,
      dataKey: "value",
      nameKey: "name",
      color: "hsl(var(--chart-2))",
    },
    layout: { order: 8 },
  },

  // ============================================
  // METRIC 9: Top Languages
  // ============================================
  {
    id: "top-languages",
    title: "Top 10 Languages",
    description: "Languages with most issues",
    category: "distribution",
    dataSource: { type: "topN", params: { field: "language", n: 10 } },
    labelFormatters: {
      xAxis: (value: string) => value,
      yAxis: (value: number) => value.toString(),
      tooltip: (value: number, _name: string, props: TooltipProps) => [
        `${value} issues`,
        `${Number(props.payload?.percentage ?? 0).toFixed(1)}% of total`,
      ],
    },
    component: { type: "barChart", renderer: BarChart },
    componentProps: {
      height: 400,
      dataKey: "count",
      nameKey: "name",
      color: "hsl(var(--chart-3))",
    },
    layout: { order: 9 },
  },

  // ============================================
  // METRIC 10: Reason Distribution
  // ============================================
  {
    id: "reason-distribution",
    title: "Common Issues",
    description: "Distribution of issues by reason",
    category: "distribution",
    dataSource: { type: "distribution", params: { field: "reason" } },
    labelFormatters: {
      yAxis: (value: string) => value,
      xAxis: (value: number) => value.toString(),
      tooltip: (value: number, _name: string, props: TooltipProps) => [
        `${value} issues`,
        `${Number(props.payload?.percentage ?? 0).toFixed(1)}% of total`,
      ],
    },
    component: { type: "horizontalBarChart", renderer: HorizontalBarChart },
    componentProps: {
      height: 300,
      dataKey: "value",
      nameKey: "name",
      color: "hsl(var(--chart-4))",
    },
    layout: { order: 10 },
  },
]
