import { ConvexIssue } from "@/app/types"
import { MetricConfig } from "../types/MetricConfig"
import { DataExtractor } from "./DataExtractor"
import { TransformPipeline } from "./TransformPipeline"

export class MetricEngine {
  private dataExtractor: DataExtractor
  private transformPipeline: TransformPipeline

  constructor() {
    this.dataExtractor = new DataExtractor()
    this.transformPipeline = new TransformPipeline()
  }

  /**
   * Process a metric configuration and return rendered data
   */
  processMetric(
    config: MetricConfig,
    issues: ConvexIssue[],
    context?: Record<string, any>
  ): any {
    // 1. Extract raw data
    let data = this.dataExtractor.extract(
      config.dataSource,
      issues,
      context
    )

    // 2. Apply transformations
    if (config.transforms && config.transforms.length > 0) {
      data = this.transformPipeline.apply(data, config.transforms)
    }

    // 3. Check render condition
    if (config.renderCondition && !config.renderCondition(data)) {
      return null
    }

    return data
  }

  /**
   * Process multiple metrics (handles dependencies)
   */
  processMetrics(
    configs: MetricConfig[],
    issues: ConvexIssue[],
    context?: Record<string, any>
  ): Map<string, any> {
    const results = new Map<string, any>()
    const processed = new Set<string>()
    const toProcess = [...configs]

    while (toProcess.length > 0) {
      const config = toProcess.shift()!

      // Check if dependencies are met
      if (config.dependencies) {
        const dependenciesMet = config.dependencies.every(dep =>
          processed.has(dep)
        )

        if (!dependenciesMet) {
          toProcess.push(config) // Re-queue
          continue
        }
      }

      // Add dependency results to context
      const enrichedContext = {
        ...context,
        metrics: Object.fromEntries(results)
      }

      // Process metric
      const data = this.processMetric(config, issues, enrichedContext)
      results.set(config.id, data)
      processed.add(config.id)
    }

    return results
  }
}
