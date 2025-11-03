// Aggregations
export * from './aggregations'

// Filtering
export * from './filtering'

// Statistical
export * from './statistical'

// Formatting
export * from './formatting'

// Sorting
export function sortBy(data: any[], params: { field: string; order?: 'asc' | 'desc' }): any[] {
  const order = params.order || 'asc'
  return [...data].sort((a, b) => {
    const aVal = a[params.field]
    const bVal = b[params.field]

    if (order === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
    }
  })
}

export function sortByCount(data: any[], params?: { order?: 'asc' | 'desc' }): any[] {
  return sortBy(data, { field: 'count', order: params?.order || 'desc' })
}

// Grouping
export function groupBy(data: any[], params: { field: string }): Record<string, any[]> {
  return data.reduce((acc, item) => {
    const key = item[params.field] || 'Unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, any[]>)
}

export function groupByDate(
  data: any[],
  params: { field: string; groupBy: 'day' | 'week' | 'month' | 'year' }
): Record<string, any[]> {
  return data.reduce((acc, item) => {
    const date = new Date(item[params.field])
    let key: string

    switch (params.groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      case 'year':
        key = String(date.getFullYear())
        break
      default:
        key = date.toISOString().split('T')[0]
    }

    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, any[]>)
}
