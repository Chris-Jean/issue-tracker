import { ConvexIssue } from "@/app/types"

interface VolumeMetrics {
  total: number
  today: number
  thisWeek: number
  thisMonth: number
}

/**
 * Extracts ticket volume metrics (total, today, this week, this month)
 * based on issue creation or incident dates.
 */
export function extractVolume(
  issues: ConvexIssue[]
): VolumeMetrics {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()

  // Normalize timestamps for filtering
  const getTimestamp = (issue: ConvexIssue): number => {
    if (issue.dateOfIncident) return new Date(issue.dateOfIncident).getTime()
    return issue._creationTime || 0
  }

  return {
    total: issues.length,
    today: issues.filter((i) => getTimestamp(i) >= todayStart).length,
    thisWeek: issues.filter((i) => getTimestamp(i) >= weekStart).length,
    thisMonth: issues.filter((i) => getTimestamp(i) >= monthStart).length,
  }
}