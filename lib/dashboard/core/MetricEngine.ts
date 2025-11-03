import { ConvexIssue } from "@/app/types"
import { MetricConfig } from "../types/MetricConfig"
import { DataExtractor } from "./DataExtractor"
import { TransformPipeline } from "./TransformPipeline"

type Context = Record<string, unknown>

/**
 * ⚙️ MetricEngine
 * Orchestrates metric data extraction, transformation, and dependency resolution.
 */
export class MetricEngine {
  private readonly dataExtractor: DataExtractor
  private readonly transformPipeline: TransformPipeline

  constructor() {
    this.dataExtractor = new DataExtractor()
    this.transformPipeline = new TransformPipeline()
  }

  /**
   * Process a single metric configuration and return its computed data.
   */
  processMetric(
    config: MetricConfig,
    issues: ConvexIssue[],
    context: Context = {}
  ): unknown {
    // 1️⃣ Extract raw data
    let data = this.dataExtractor.extract(config.dataSource, issues, context)

    // 2️⃣ Apply transformation pipeline
    if (config.transforms?.length) {
      data = this.transformPipeline.apply(data, config.transforms)
    }

    // 3️⃣ Render condition check
    if (config.renderCondition && !config.renderCondition(data)) {
      return null
    }

    return data
  }

  /**
   * Process multiple metrics — supports dependency resolution.
   */
  processMetrics(
    configs: MetricConfig[],
    issues: ConvexIssue[],
    context: Context = {}
  ): Map<string, unknown> {
    const results = new Map<string, unknown>()
    const processed = new Set<string>()
    const toProcess = [...configs]

    while (toProcess.length > 0) {
      const config = toProcess.shift()!

      // Ensure dependencies are met
      if (config.dependencies) {
        const dependenciesMet = config.dependencies.every(dep =>
          processed.has(dep)
        )

        if (!dependenciesMet) {
          toProcess.push(config)
          continue
        }
      }

      // Include dependency results in context
      const enrichedContext: Context = {
        ...context,
        metrics: Object.fromEntries(results),
      }

      // Compute metric
      const data = this.processMetric(config, issues, enrichedContext)
      results.set(config.id, data)
      processed.add(config.id)
    }

    return results
  }
}