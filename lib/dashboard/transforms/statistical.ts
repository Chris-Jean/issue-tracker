export function percentage(
  data: any[],
  params: { field: string; total?: number }
): any[] {
  const total = params.total || data.reduce((sum, item) => sum + item[params.field], 0)

  return data.map(item => ({
    ...item,
    percentage: (item[params.field] / total) * 100
  }))
}

export function percentageChange(
  data: { current: number; previous: number }
): number {
  if (data.previous === 0) return 0
  return ((data.current - data.previous) / data.previous) * 100
}

export function trend(
  data: any[],
  params: { field: string; periods?: number }
): { value: number; direction: 'up' | 'down' | 'neutral' } {
  const periods = params.periods || data.length
  const recentData = data.slice(-periods)

  if (recentData.length < 2) {
    return { value: 0, direction: 'neutral' }
  }

  const first = recentData[0][params.field]
  const last = recentData[recentData.length - 1][params.field]

  const change = ((last - first) / first) * 100

  return {
    value: Math.abs(change),
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
  }
}

export function ranking(data: any[], params: { by: string }): any[] {
  return data
    .sort((a, b) => b[params.by] - a[params.by])
    .map((item, index) => ({
      ...item,
      rank: index + 1
    }))
}

export function normalize(data: any[], params: { field: string }): any[] {
  const values = data.map(item => item[params.field])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min

  if (range === 0) return data

  return data.map(item => ({
    ...item,
    [`${params.field}Normalized`]: ((item[params.field] - min) / range) * 100
  }))
}
