import { Transform } from "../types/MetricConfig"
import * as transforms from "../transforms"

export class TransformPipeline {
  /**
   * Apply a series of transformations to data
   */
  apply(data: any, transformConfigs: Transform[]): any {
    let result = data

    for (const config of transformConfigs) {
      result = this.applyTransform(result, config)
    }

    return result
  }

  /**
   * Apply a single transformation
   */
  private applyTransform(data: any, config: Transform): any {
    // Use custom function if provided
    if (config.fn) {
      return config.fn(data, config.params)
    }

    // Use built-in transform
    const transform = this.getTransform(config.type)
    if (!transform) {
      throw new Error(`Unknown transform type: ${config.type}`)
    }

    return transform(data, config.params)
  }

  private getTransform(type: string): Function | null {
    const transformMap: Record<string, Function> = {
      // Aggregations
      count: transforms.count,
      sum: transforms.sum,
      average: transforms.average,

      // Filtering
      filter: transforms.filter,
      filterByDate: transforms.filterByDate,
      top: transforms.top,
      bottom: transforms.bottom,

      // Sorting
      sortBy: transforms.sortBy,
      sortByCount: transforms.sortByCount,

      // Grouping
      groupBy: transforms.groupBy,
      groupByDate: transforms.groupByDate,

      // Statistical
      percentage: transforms.percentage,
      percentageChange: transforms.percentageChange,
      trend: transforms.trend,

      // Formatting
      round: transforms.round,
      formatNumber: transforms.formatNumber,
      formatPercentage: transforms.formatPercentage,
    }

    return transformMap[type] || null
  }
}
