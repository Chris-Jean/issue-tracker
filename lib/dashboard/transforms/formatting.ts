export function round(value: number, params?: { decimals?: number }): number {
  const decimals = params?.decimals ?? 0
  const multiplier = Math.pow(10, decimals)
  return Math.round(value * multiplier) / multiplier
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatCurrency(value: number, params?: { currency?: string }): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: params?.currency || 'USD'
  }).format(value)
}

export function formatPercentage(value: number, params?: { decimals?: number }): string {
  const decimals = params?.decimals ?? 1
  return `${value.toFixed(decimals)}%`
}
