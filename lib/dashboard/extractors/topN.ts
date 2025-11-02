import { ConvexIssue } from "@/app/types"

export function extractTopN(
  issues: ConvexIssue[],
  params: { field: keyof ConvexIssue; n: number }
): Array<{ name: string; count: number; percentage: number }> {
  const counts = new Map<string, number>()

  issues.forEach(issue => {
    const value = (issue[params.field] as string) || 'Unknown'
    counts.set(value, (counts.get(value) || 0) + 1)
  })

  const total = issues.length

  return Array.from(counts.entries())
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, params.n)
}
