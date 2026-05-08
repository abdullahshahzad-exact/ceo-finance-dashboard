import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react'

interface AIInsightProps {
  changed: string
  drivers: string[]
  risks: string[]
  actions: string[]
}

export default function AIInsight({ changed, drivers, risks, actions }: AIInsightProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-5 border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-indigo-600/30 flex items-center justify-center">
          <Sparkles size={13} className="text-indigo-400" />
        </div>
        <span className="text-sm font-semibold text-indigo-300">AI Insight</span>
        <span className="ml-auto text-[10px] text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded-full">Auto-generated</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={12} className="text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">vs Last Period</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{changed}</p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={12} className="text-indigo-400" />
            <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">Top Drivers</span>
          </div>
          <ul className="space-y-1">
            {drivers.map((d, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="text-indigo-500 mt-0.5">›</span>
                {d}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle size={12} className="text-amber-400" />
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Risks</span>
          </div>
          <ul className="space-y-1">
            {risks.map((r, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="text-amber-500 mt-0.5">›</span>
                {r}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb size={12} className="text-green-400" />
            <span className="text-[11px] font-semibold text-green-400 uppercase tracking-wider">Actions</span>
          </div>
          <ul className="space-y-1">
            {actions.map((a, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="text-green-500 mt-0.5">›</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
