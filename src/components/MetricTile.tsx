import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import clsx from 'clsx'

interface MetricTileProps {
  title: string
  value: string
  subtitle?: string
  change?: number
  changeLabel?: string
  color?: 'default' | 'green' | 'red' | 'amber' | 'indigo'
  to?: string
  large?: boolean
}

export default function MetricTile({ title, value, subtitle, change, changeLabel, color = 'default', to, large }: MetricTileProps) {
  const navigate = useNavigate()

  const colorMap = {
    default: 'text-white',
    green: 'text-green-400',
    red: 'text-red-400',
    amber: 'text-amber-400',
    indigo: 'text-indigo-400',
  }

  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0

  return (
    <div
      className={clsx('metric-tile animate-slide-up', to && 'cursor-pointer')}
      onClick={() => to && navigate(to)}
    >
      <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">{title}</p>
      <p className={clsx('font-bold leading-none', large ? 'text-3xl' : 'text-2xl', colorMap[color])}>{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      {change !== undefined && (
        <div className={clsx('flex items-center gap-1 mt-2 text-xs font-medium',
          isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-slate-400')}>
          {isPositive ? <TrendingUp size={11} /> : isNegative ? <TrendingDown size={11} /> : <Minus size={11} />}
          <span>{isPositive ? '+' : ''}{change.toFixed(1)}% {changeLabel || 'vs last month'}</span>
        </div>
      )}
    </div>
  )
}
