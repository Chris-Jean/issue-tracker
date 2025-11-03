/* eslint-disable @typescript-eslint/no-unused-vars */
import { ConvexIssue } from "@/app/types"

export { extractVolume } from "./volume"
export { extractTopN } from "./topN"
export { extractTimeSeries } from "./timeSeries"
export { extractDistribution } from "./distribution"

export function extractComparison(
  _issues: ConvexIssue[],
  _params?: Record<string, unknown>
): null {
  return null
}

export function extractAggregation(
  _issues: ConvexIssue[],
  _params?: Record<string, unknown>
): null {
  return null
}
/* eslint-enable @typescript-eslint/no-unused-vars */
