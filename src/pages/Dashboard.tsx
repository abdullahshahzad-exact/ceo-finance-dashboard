import { useState } from 'react'
import { useSalesSummary, useProductsSalesStatistics } from '../lib/subiekt'
import { TrendingUp, ShoppingCart, Package, DollarSign, BarChart2,
  AlertTriangle, Percent, Activity, CreditCard, CalendarRange } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Convert YYYY-MM-DD to ISO 8601 datetime string for Subiekt API */
function toIso(date: string, endOfDay = false) {
  return endOfDay ? `${date}T23:59:59Z` : `${date}T00:00:00Z`
}

const fmtNum = (n: number) => new Intl.NumberFormat('pl-PL').format(Math.round(n))
const fmtPln = (n: number) => `PLN ${fmtNum(n)}`

const CHART_COLORS = ['#7C3AED','#F97316','#10B981','#EF4444','#3B82F6','#F59E0B','#EC4899','#06B6D4']

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon: Icon, iconBg, iconColor, trend, info }: any) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">
            {title}{info && <span className="ml-1 text-gray-300 text-[10px]">ⓘ</span>}
          </p>
          <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 ${iconBg ?? 'bg-purple-50'} rounded-full flex items-center justify-center flex-shrink-0`}>
          <Icon size={18} className={iconColor ?? 'text-purple-600'} strokeWidth={1.8} />
        </div>
      </div>
      {trend != null && (
        <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
          trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  )
}

// ── Date filter bar ───────────────────────────────────────────────────────────

function FilterBar({ startDate, endDate, setStartDate, setEndDate, today, last30, last7 }: any) {
  const presets = [
    { label: 'Jan–Mar 2026', s: '2026-01-01', e: '2026-03-31' },
    { label: 'Last 30d', s: last30, e: today },
    { label: 'Last 7d', s: last7, e: today },
    { label: 'This Year', s: '2026-01-01', e: today },
    { label: '2025 Full', s: '2025-01-01', e: '2025-12-31' },
  ]
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 bg-[#7C3AED] text-white text-xs rounded-lg px-3 py-1.5 font-medium">
        <CalendarRange size={13} strokeWidth={2} />
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
          className="bg-transparent text-white outline-none w-[90px]" style={{ colorScheme: 'dark' }} />
        <span className="opacity-70">–</span>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
          className="bg-transparent text-white outline-none w-[90px]" style={{ colorScheme: 'dark' }} />
      </div>
      {presets.map(({ label, s, e }) => (
        <button key={label} onClick={() => { setStartDate(s); setEndDate(e) }}
          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
            startDate === s && endDate === e
              ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
              : 'bg-white text-gray-500 border-gray-200 hover:border-[#7C3AED] hover:text-[#7C3AED]'
          }`}>
          {label}
        </button>
      ))}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const today = new Date().toISOString().slice(0, 10)
  const last30 = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10)
  const last7  = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10)
  const [startDate, setStartDate] = useState('2026-01-01')
  const [endDate, setEndDate]     = useState(today)

  const dateParams = {
    DateFrom: toIso(startDate, false),
    DateTo:   toIso(endDate, true),
  }

  const { data: summary, loading: summLoading, error: summError } = useSalesSummary(dateParams)

  const { data: topProductsPage, loading: topLoading } = useProductsSalesStatistics({
    Page: 1, PageSize: 8,
    SortBy: 'totalNetSales', SortOrder: 'desc',
    ...dateParams,
  })

  const loading = summLoading || topLoading

  // Core metrics
  const totalGross   = summary?.totalGrossSales          ?? 0
  const totalNet     = summary?.totalNetSales             ?? 0
  const totalQty     = summary?.totalQuantity             ?? 0
  const totalProfit  = summary?.totalProfit               ?? 0
  const totalCost    = summary?.totalCost                 ?? 0
  const avgMargin    = summary?.averageProfitMarginPercent ?? 0

  const sortedTopProducts = (topProductsPage?.items ?? []) as any[]

  const topProducts = sortedTopProducts.map((p: any) => ({
    name: (p.productSymbol ?? '').slice(0, 22),
    'Net Sales': Math.round(p.totalNetSales ?? 0),
    'Cost':      Math.round(p.totalCost ?? 0),
    'Profit':    Math.round(p.totalProfit ?? 0),
  }))

  const marginPie = sortedTopProducts.slice(0, 6).map((p: any) => ({
    name: (p.productSymbol ?? '').slice(0, 22),
    value: Math.max(0, Math.round(p.totalNetSales ?? 0)),
  })).filter((d: any) => d.value > 0)

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">ExactFlow Financial Intelligence</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {['All Channels', 'All Countries', 'All Categories'].map(f => (
            <button key={f} className="flex items-center gap-1 text-xs text-gray-600 border border-gray-200 bg-white rounded-lg px-3 py-1.5 hover:border-purple-300">
              {f} <span className="opacity-40 ml-0.5">▾</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date filter */}
      <FilterBar
        startDate={startDate} endDate={endDate}
        setStartDate={setStartDate} setEndDate={setEndDate}
        today={today} last30={last30} last7={last7}
      />

      {/* API error */}
      {summError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
          ⚠️ Subiekt API error: {summError}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !summary && (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 animate-pulse h-[90px]" />
          ))}
        </div>
      )}

      {/* KPI Row 1 */}
      {(!loading || summary) && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <KpiCard
              title="Total Gross Sales" info
              value={totalGross > 0 ? fmtPln(totalGross) : '—'}
              sub={`${startDate.slice(0,7)} → ${endDate.slice(0,7)}`}
              icon={DollarSign} iconBg="bg-green-50" iconColor="text-green-600"
            />
            <KpiCard
              title="Net Sales" info
              value={totalNet > 0 ? fmtPln(totalNet) : '—'}
              sub="Excl. VAT"
              icon={BarChart2} iconBg="bg-blue-50" iconColor="text-blue-500"
            />
            <KpiCard
              title="Units Sold" info
              value={totalQty > 0 ? totalQty.toLocaleString() : '—'}
              sub="All products"
              icon={Package} iconBg="bg-indigo-50" iconColor="text-indigo-500"
            />
          </div>

          {/* KPI Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <KpiCard
              title="Gross Profit" info
              value={totalProfit > 0 ? fmtPln(totalProfit) : '—'}
              sub="Net Sales − Cost"
              icon={TrendingUp} iconBg="bg-pink-50" iconColor="text-pink-500"
            />
            <KpiCard
              title="Avg Profit Margin" info
              value={avgMargin > 0 ? `${avgMargin.toFixed(2)}%` : '—'}
              sub="From API"
              icon={Percent} iconBg="bg-orange-50" iconColor="text-orange-500"
            />
            <KpiCard
              title="Total Cost (COGS)" info
              value={totalCost > 0 ? fmtPln(totalCost) : '—'}
              sub="Warehouse cost of goods sold"
              icon={Activity} iconBg="bg-teal-50" iconColor="text-teal-600"
            />
          </div>

          {/* KPI Row 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <KpiCard
              title="Top Product Revenue" info
              value={sortedTopProducts[0]
                ? fmtPln(sortedTopProducts[0].totalNetSales ?? 0)
                : topLoading ? '…' : '—'}
              sub={(sortedTopProducts[0]?.productName ?? '').slice(0, 32) || (topLoading ? 'Loading...' : 'No data')}
              icon={ShoppingCart} iconBg="bg-emerald-50" iconColor="text-emerald-600"
            />
            <KpiCard
              title="Top Product Cost" info
              value={sortedTopProducts[0]
                ? fmtPln(sortedTopProducts[0].totalCost ?? 0)
                : topLoading ? '…' : '—'}
              sub={(sortedTopProducts[0]?.productName ?? '').slice(0, 32) || (topLoading ? 'Loading...' : 'No data')}
              icon={CreditCard} iconBg="bg-cyan-50" iconColor="text-cyan-600"
            />
            <KpiCard
              title="Top Product Profit" info
              value={sortedTopProducts[0]
                ? fmtPln(sortedTopProducts[0].totalProfit ?? 0)
                : topLoading ? '…' : '—'}
              sub={(sortedTopProducts[0]?.productName ?? '').slice(0, 32) || (topLoading ? 'Loading...' : 'No data')}
              icon={AlertTriangle} iconBg="bg-amber-50" iconColor="text-amber-500"
            />
          </div>
        </>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top 8 Products by Net Sales */}
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">Top 8 Products by Net Sales</h3>
          <p className="text-xs text-gray-400 mb-3">{startDate} → {endDate}</p>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts} layout="vertical" barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v)} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip formatter={(v: number) => [fmtPln(v), '']}
                  contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Net Sales" fill="#7C3AED" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Cost"      fill="#F59E0B" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Profit"    fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm">
              {summLoading ? 'Loading...' : 'No data for this period'}
            </div>
          )}
        </div>

        {/* Revenue share by product (donut) */}
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">Revenue Share — Top 6 Products</h3>
          <p className="text-xs text-gray-400 mb-3">By net sales value</p>
          {marginPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={marginPie} cx="50%" cy="50%" innerRadius={52} outerRadius={82}
                  dataKey="value" paddingAngle={2}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}>
                  {marginPie.map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [fmtPln(v), 'Net Sales']}
                  contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm">
              {topLoading ? 'Loading...' : 'No data for this period'}
            </div>
          )}
        </div>
      </div>

      {/* Summary metrics strip */}
      {summary && (
        <div className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Period Summary — {startDate} → {endDate}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Gross Sales',  value: fmtPln(totalGross),  color: 'text-gray-900' },
              { label: 'Net Sales',    value: fmtPln(totalNet),    color: 'text-gray-900' },
              { label: 'COGS',         value: fmtPln(totalCost),   color: 'text-amber-600' },
              { label: 'Profit',       value: fmtPln(totalProfit), color: totalProfit >= 0 ? 'text-green-600' : 'text-red-600' },
              { label: 'Units Sold',   value: fmtNum(totalQty), color: 'text-gray-900' },
              { label: 'Avg Margin',   value: `${avgMargin.toFixed(2)}%`, color: avgMargin >= 20 ? 'text-green-600' : avgMargin >= 10 ? 'text-amber-600' : 'text-red-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <div className="text-gray-400 text-xs mb-1">{label}</div>
                <div className={`font-bold text-sm ${color}`}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
