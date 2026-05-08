import { RefreshCw, Bell, Filter } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface HeaderProps {
  title: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [refreshing, setRefreshing] = useState(false)
  const now = new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw'
  })

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1500)
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-[#1e293b] border-b border-[#334155] sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-bold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400 hidden sm:block">Updated: {now} CET</span>

        <div className="flex items-center gap-1.5">
          <select className="text-xs bg-slate-700 border border-slate-600 text-slate-300 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-500">
            <option>MTD</option>
            <option>LTM</option>
            <option>YTD</option>
            <option>Q1 2026</option>
          </select>
          <select className="text-xs bg-slate-700 border border-slate-600 text-slate-300 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-500">
            <option>All Channels</option>
            <option>Back Market</option>
            <option>Refurbed</option>
            <option>B2B</option>
            <option>Shopify</option>
            <option>Amazon</option>
          </select>
          <button className="p-1.5 rounded-lg bg-slate-700 border border-slate-600 text-slate-400 hover:text-white transition-colors">
            <Filter size={13} />
          </button>
        </div>

        <button
          onClick={handleRefresh}
          className="p-1.5 rounded-lg bg-slate-700 border border-slate-600 text-slate-400 hover:text-white transition-colors"
        >
          <motion.div animate={{ rotate: refreshing ? 360 : 0 }} transition={{ duration: 0.8 }}>
            <RefreshCw size={13} />
          </motion.div>
        </button>

        <div className="relative">
          <button className="p-1.5 rounded-lg bg-slate-700 border border-slate-600 text-slate-400 hover:text-white transition-colors">
            <Bell size={13} />
          </button>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">4</span>
        </div>
      </div>
    </div>
  )
}
