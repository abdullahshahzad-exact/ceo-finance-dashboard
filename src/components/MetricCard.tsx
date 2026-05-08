import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, formatNumber, formatPercent } from '../utils/format'
import { useNavigate } from 'react-router-dom'

interface MetricCardProps {
  label: string
  value: number
  subValue?: string
  change?: number
  changeLabel?: string
  format?: 'currency' | 'number' | 'percent'
  severity?: 'normal' | 'warning' | 'danger' | 'success'
  icon?: React.ReactNode
  drillTo?: string
  index?: number
}

export default function MetricCard({
  label, value, subValue, change, changeLabel,
  format = 'currency', severity = 'normal',
  icon, drillTo, index = 0
}: MetricCardProps) {
  const navigate = useNavigate()

  const formatted = format === 'currency'
    ? formatCurrency(value)
    : format === 'percent'
    ? formatPercent(value)
    : formatNumber(value)

  const severityBorder = {
    normal: 'border-slate-700/50',
    warning: 'border-amber-500/40',
    danger: 'border-red-500/40',
    success: 'border-green-500/40',
  }[severity]

  const severityGlow = {
    normal: '',
    warning: 'shadow-amber-500/10',
    danger: 'shadow-red-500/15',
    success: 'shadow-green-500/10',
  }[severity]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => drillTo && navigate(drillTo)}
      className={`metric-card p-4 border ${severityBorder} shadow-lg ${severityGlow} ${drillTo ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</span>
        {icon && <div className="text-slate-500">{icon}</div>}
      </div>

      <div className={`text-2xl font-bold mb-1 ${
        severity === 'danger' ? 'text-red-400' :
        severity === 'warning' ? 'text-amber-400' :
        severity === 'success' ? 'text-green-400' :
        'text-white'
      }`}>
        {formatted}
      </div>

      {subValue && (
        <div className="text-xs text-slate-400 mb-2">{subValue}</div>
      )}

      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${
          change >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          <span>{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span>
          {changeLabel && <span className="text-slate-500 font-normal ml-0.5">{changeLabel}</span>}
        </div>
      )}
    </motion.div>
  )
}
