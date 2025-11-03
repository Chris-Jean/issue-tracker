export function count(data: any[]): number {
  return data.length
}

export function sum(data: any[], params: { field: string }): number {
  return data.reduce((acc, item) => acc + (item[params.field] || 0), 0)
}

export function average(data: any[], params: { field: string }): number {
  if (data.length === 0) return 0
  return sum(data, params) / data.length
}

export function median(data: any[], params: { field: string }): number {
  if (data.length === 0) return 0

  const sorted = [...data].sort((a, b) =>
    a[params.field] - b[params.field]
  )

  const mid = Math.floor(sorted.length / 2)

  return sorted.length % 2 === 0
    ? (sorted[mid - 1][params.field] + sorted[mid][params.field]) / 2
    : sorted[mid][params.field]
}

export function min(data: any[], params: { field: string }): number {
  return Math.min(...data.map(item => item[params.field] || Infinity))
}

export function max(data: any[], params: { field: string }): number {
  return Math.max(...data.map(item => item[params.field] || -Infinity))
}
