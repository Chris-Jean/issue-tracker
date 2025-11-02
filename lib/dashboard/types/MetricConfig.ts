import { ConvexIssue } from "@/app/types"
import { ComponentType } from "react"

// ============================================
// Core Configuration Types
// ============================================

export type MetricId = string

export interface MetricConfig {
  id: MetricId
  title: string
  description?: string
  category: MetricCategory

  // Data extraction
  dataSource: DataExtractorConfig

  // Transformation pipeline
  transforms?: Transform[]

  // Label formatting
  labelFormatters?: LabelFormatters

  // Component rendering
  component: ChartComponent
  componentProps?: Record<string, any>

  // Layout
  layout: LayoutConfig

  // Conditional rendering
  renderCondition?: (data: any) => boolean

  // Dependencies (for computed metrics)
  dependencies?: MetricId[]
}

export type MetricCategory =
  | 'volume'
  | 'distribution'
  | 'trend'
  | 'comparison'
  | 'performance'

// ============================================
// Data Extraction
// ============================================

export type DataExtractorConfig = {
  type: ExtractorType
  params?: Record<string, any>
  // Custom extractor function
  extract?: (issues: ConvexIssue[], params?: any) => any
}

export type ExtractorType =
  | 'volume'           // Total counts
  | 'topN'             // Top N by field
  | 'timeSeries'       // Time-based data points
  | 'distribution'     // Category distribution
  | 'comparison'       // Period comparison
  | 'aggregation'      // Custom aggregation
  | 'custom'           // Custom function

// ============================================
// Transformations
// ============================================

export type Transform = {
  type: TransformType
  params?: Record<string, any>
  // Custom transform function
  fn?: (data: any, params?: any) => any
}

export type TransformType =
  // Aggregations
  | 'count'
  | 'sum'
  | 'average'
  | 'median'
  | 'min'
  | 'max'

  // Filtering
  | 'filter'
  | 'filterByDate'
  | 'filterByField'
  | 'top'
  | 'bottom'

  // Sorting
  | 'sortBy'
  | 'sortByCount'
  | 'sortByDate'

  // Grouping
  | 'groupBy'
  | 'groupByDate'
  | 'groupByField'

  // Statistical
  | 'percentage'
  | 'percentageChange'
  | 'trend'
  | 'ranking'
  | 'normalize'

  // Temporal
  | 'dateRange'
  | 'timeWindow'
  | 'rollingAverage'
  | 'weekOverWeek'
  | 'monthOverMonth'

  // Formatting
  | 'round'
  | 'formatNumber'
  | 'formatCurrency'
  | 'formatPercentage'

  // Custom
  | 'custom'

// ============================================
// Label Formatting
// ============================================

export interface LabelFormatters {
  xAxis?: LabelFormatter
  yAxis?: LabelFormatter
  tooltip?: TooltipFormatter
  legend?: LabelFormatter
  value?: ValueFormatter
}

export type LabelFormatter = (value: any, index?: number, data?: any) => string

export type ValueFormatter = (value: number) => string

export type TooltipFormatter = (value: any, name: string, props: any) => string[]

// ============================================
// Component Configuration
// ============================================

export interface ChartComponent {
  type: ChartType
  renderer: ComponentType<any>
}

export type ChartType =
  | 'statCard'
  | 'barChart'
  | 'horizontalBarChart'
  | 'lineChart'
  | 'areaChart'
  | 'donutChart'
  | 'pieChart'
  | 'stackedBarChart'
  | 'composedChart'
  | 'heatmap'
  | 'treemap'
  | 'gauge'
  | 'custom'

// ============================================
// Layout Configuration
// ============================================

export interface LayoutConfig {
  // Grid positioning
  row?: number
  column?: number
  rowSpan?: number
  columnSpan?: number

  // Responsive breakpoints
  responsive?: {
    mobile?: Partial<LayoutConfig>
    tablet?: Partial<LayoutConfig>
    desktop?: Partial<LayoutConfig>
  }

  // Order
  order?: number

  // Visibility
  hidden?: boolean
}

// ============================================
// Chart Data Types
// ============================================

export interface StatCardData {
  value: number
  label: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    label?: string
  }
  subValue?: string
}

export interface BarChartDataPoint {
  name: string
  value: number
  label?: string
  color?: string
  [key: string]: any
}

export interface TimeSeriesDataPoint {
  date: string
  value: number
  label: string
  [key: string]: any
}

export interface DistributionDataPoint {
  name: string
  value: number
  percentage: number
  color?: string
}
