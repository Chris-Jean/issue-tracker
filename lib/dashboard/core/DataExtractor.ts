import { ConvexIssue } from "@/app/types";
import { DataExtractorConfig } from "../types/MetricConfig";
import * as extractors from "../extractors";

type Context = Record<string, unknown>;
type ExtractorFn = (
  issues: ConvexIssue[],
  params?: Record<string, unknown>,
  context?: Context
) => unknown;

export class DataExtractor {
  /**
   * Extract data based on extractor configuration
   */
  extract(
    config: DataExtractorConfig,
    issues: ConvexIssue[],
    context?: Context
  ): unknown {
    // Use custom extractor if provided
    if (config.extract) {
      return config.extract(issues, config.params);
    }

    // Use built-in extractor
    const extractor = this.getExtractor(config.type);
    if (!extractor) {
      throw new Error(`Unknown extractor type: ${config.type}`);
    }

    return extractor(issues, config.params, context);
  }

  private getExtractor(type: string): ExtractorFn | null {
    const extractorMap: Record<string, ExtractorFn> = {
      volume: extractors.extractVolume,
      topN: extractors.extractTopN,
      timeSeries: extractors.extractTimeSeries,
      distribution: extractors.extractDistribution,
      comparison: extractors.extractComparison,
      aggregation: extractors.extractAggregation,
    };

    return extractorMap[type] ?? null;
  }
}
