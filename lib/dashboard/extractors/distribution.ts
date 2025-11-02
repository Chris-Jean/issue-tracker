import { ConvexIssue } from "@/app/types"

export function extractDistribution(
  issues: ConvexIssue[],
  params: { field: keyof ConvexIssue }
): Array<{ name: string; value: number; percentage: number }> {
  const counts = new Map<string, number>()

  issues.forEach(issue => {
    const value = (issue[params.field] as string) || 'Unknown'
    counts.set(value, (counts.get(value) || 0) + 1)
  })

  const total = issues.length

  return Array.from(counts.entries())
    .map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value)
}
