import { ConvexIssue } from "@/app/issues/types"

export function extractTimeSeries(
  issues: ConvexIssue[],
  params: {
    field: keyof ConvexIssue
    days: number
    groupBy?: 'hour' | 'day' | 'week' | 'month'
  }
): Array<{ date: string; value: number; label: string }> {
  const groupBy = params.groupBy || 'day'
  const days = params.days || 30

  const now = new Date()
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  const dataMap = new Map<string, number>()

  issues.forEach(issue => {
    const timestamp = issue[params.field]
    if (!timestamp) return

    // ✅ Only process if the field is a string or number
    if (typeof timestamp !== "string" && typeof timestamp !== "number") return

    const date = new Date(timestamp)
    if (isNaN(date.getTime()) || date < startDate) return

    const key = getGroupKey(date, groupBy)
    dataMap.set(key, (dataMap.get(key) || 0) + 1)
  })

  // Fill in missing dates with 0
  const result: Array<{ date: string; value: number; label: string }> = []

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
    const key = getGroupKey(date, groupBy)

    result.push({
      date: key,
      value: dataMap.get(key) || 0,
      label: formatDateLabel(date, groupBy)
    })
  }

  return result
}

function getGroupKey(date: Date, groupBy: string): string {
  switch (groupBy) {
    case 'hour':
      return date.toISOString().slice(0, 13)
    case 'day':
      return date.toISOString().slice(0, 10)
    case 'week':
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      return weekStart.toISOString().slice(0, 10)
    case 'month':
      return date.toISOString().slice(0, 7)
    default:
      return date.toISOString().slice(0, 10)
  }
}

function formatDateLabel(date: Date, groupBy: string): string {
  switch (groupBy) {
    case 'hour':
      return date.toLocaleTimeString('en-US', { hour: 'numeric', timeZone: 'America/New_York' })
    case 'day':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' })
    case 'week':
      return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' })}`
    case 'month':
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'America/New_York' })
    default:
      return date.toLocaleDateString('en-US', { timeZone: 'America/New_York' })
  }
}
