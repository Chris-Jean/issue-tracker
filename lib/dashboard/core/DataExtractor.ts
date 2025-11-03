import { ConvexIssue } from "@/app/issues/types"
import { DataExtractorConfig } from "../types/MetricConfig"
import * as extractors from "../extractors"

export class DataExtractor {
  /**
   * Extract data based on extractor configuration
   */
  extract(
    config: DataExtractorConfig,
    issues: ConvexIssue[],
    context?: Record<string, any>
  ): any {
    // Use custom extractor if provided
    if (config.extract) {
      return config.extract(issues, config.params)
    }

    // Use built-in extractor
    const extractor = this.getExtractor(config.type)
    if (!extractor) {
      throw new Error(`Unknown extractor type: ${config.type}`)
    }

    return extractor(issues, config.params, context)
  }

  private getExtractor(type: string): Function | null {
    const extractorMap: Record<string, Function> = {
      volume: extractors.extractVolume,
      topN: extractors.extractTopN,
      timeSeries: extractors.extractTimeSeries,
      distribution: extractors.extractDistribution,
      comparison: extractors.extractComparison,
      aggregation: extractors.extractAggregation,
    }

    return extractorMap[type] || null
  }
}
