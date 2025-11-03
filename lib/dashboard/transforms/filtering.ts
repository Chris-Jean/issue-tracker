export function filter(
  data: any[],
  params: { predicate: (item: any) => boolean }
): any[] {
  return data.filter(params.predicate)
}

export function filterByDate(
  data: any[],
  params: {
    field: string
    startDate?: Date
    endDate?: Date
  }
): any[] {
  return data.filter(item => {
    const date = new Date(item[params.field])

    if (params.startDate && date < params.startDate) return false
    if (params.endDate && date > params.endDate) return false

    return true
  })
}

export function filterByField(
  data: any[],
  params: { field: string; values: any[] }
): any[] {
  return data.filter(item => params.values.includes(item[params.field]))
}

export function top(data: any[], params: { n: number; by?: string }): any[] {
  const sorted = params.by
    ? [...data].sort((a, b) => {
        const key = params.by as keyof typeof a
        const valA = a[key]
        const valB = b[key]
        return (Number(valB) || 0) - (Number(valA) || 0)
      })
    : data

  return sorted.slice(0, params.n)
}

export function bottom(data: any[], params: { n: number; by?: string }): any[] {
  const sorted = params.by
    ? [...data].sort((a, b) => {
        const key = params.by as keyof typeof a
        const valA = a[key]
        const valB = b[key]
        return (Number(valA) || 0) - (Number(valB) || 0)
      })
    : data

  return sorted.slice(0, params.n)
}
