import { Transform } from "../types/MetricConfig"
import * as transforms from "../transforms"

type GenericData = unknown
type GenericParams = Record<string, unknown>

/**
 * 🧩 Handles sequential data transformation for dashboard metrics.
 */
export class TransformPipeline {
  /**
   * Apply a series of transformations to data.
   */
  apply(data: GenericData, transformConfigs: Transform[]): GenericData {
    let result = data

    for (const config of transformConfigs) {
      result = this.applyTransform(result, config)
    }

    return result
  }

  /**
   * Apply a single transformation.
   */
  private applyTransform(data: GenericData, config: Transform): GenericData {
    // Use custom function if provided
    if (config.fn) {
      return config.fn(data, config.params)
    }

    // Use built-in transform
    const transformFn = this.getTransform(config.type)
    if (!transformFn) {
      throw new Error(`Unknown transform type: ${config.type}`)
    }

    return transformFn(data, config.params)
  }

  /**
   * Returns a registered transform function by name.
   */
  private getTransform(
    type: string
  ): ((data: GenericData, params?: GenericParams) => GenericData) | null {
    const transformMap: Record<
      string,
      (data: GenericData, params?: GenericParams) => GenericData
    > = {
      // Aggregations
      count: transforms.count as (data: GenericData) => GenericData,
      sum: transforms.sum as (data: GenericData, params?: GenericParams) => GenericData,
      average: transforms.average as (data: GenericData, params?: GenericParams) => GenericData,

      // Filtering
      filter: transforms.filter as (data: GenericData, params?: GenericParams) => GenericData,
      filterByDate: transforms.filterByDate as (data: GenericData, params?: GenericParams) => GenericData,
      top: transforms.top as (data: GenericData, params?: GenericParams) => GenericData,
      bottom: transforms.bottom as (data: GenericData, params?: GenericParams) => GenericData,

      // Sorting
      sortBy: transforms.sortBy as (data: GenericData, params?: GenericParams) => GenericData,
      sortByCount: transforms.sortByCount as (data: GenericData, params?: GenericParams) => GenericData,

      // Grouping
      groupBy: transforms.groupBy as (data: GenericData, params?: GenericParams) => GenericData,
      groupByDate: transforms.groupByDate as (data: GenericData, params?: GenericParams) => GenericData,

      // Statistical
      percentage: transforms.percentage as (data: GenericData, params?: GenericParams) => GenericData,
      percentageChange: transforms.percentageChange as (data: GenericData, params?: GenericParams) => GenericData,
      trend: transforms.trend as (data: GenericData, params?: GenericParams) => GenericData,

      // Formatting
      round: transforms.round as (data: GenericData, params?: GenericParams) => GenericData,
      formatNumber: transforms.formatNumber as (data: GenericData, params?: GenericParams) => GenericData,
      formatPercentage: transforms.formatPercentage as (data: GenericData, params?: GenericParams) => GenericData,
    }

    return transformMap[type] || null
  }
}
