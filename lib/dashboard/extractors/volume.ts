import { ConvexIssue } from "@/app/types"

export function extractVolume(
  issues: ConvexIssue[],
  params?: any
): {
  total: number
  today: number
  thisWeek: number
  thisMonth: number
} {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()

  // Use dateOfIncident for filtering to support demo data
  const getTimestamp = (issue: ConvexIssue): number => {
    // Try dateOfIncident first (for demo data), fallback to _creationTime
    if (issue.dateOfIncident) {
      return new Date(issue.dateOfIncident).getTime()
    }
    return issue._creationTime || 0
  }

  return {
    total: issues.length,
    today: issues.filter(i => getTimestamp(i) >= todayStart).length,
    thisWeek: issues.filter(i => getTimestamp(i) >= weekStart).length,
    thisMonth: issues.filter(i => getTimestamp(i) >= monthStart).length,
  }
}
