export function formatCurrency(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-EU').format(value)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatChange(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

export function getSeverityColor(severity: 'RED' | 'AMBER' | 'GREEN'): string {
  switch (severity) {
    case 'RED': return 'text-red-400'
    case 'AMBER': return 'text-amber-400'
    case 'GREEN': return 'text-green-400'
  }
}

export function getSeverityBg(severity: 'RED' | 'AMBER' | 'GREEN'): string {
  switch (severity) {
    case 'RED': return 'bg-red-500/10 text-red-400 border-red-500/30'
    case 'AMBER': return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    case 'GREEN': return 'bg-green-500/10 text-green-400 border-green-500/30'
  }
}
