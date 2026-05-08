import { useState } from 'react'
import { useSalesSummary, useProductsSalesStatistics } from '../lib/subiekt'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from 'recharts'
import {
  DollarSign, TrendingUp, Package, Percent,
  CreditCard, CalendarRange, ArrowUpDown,
} from 'lucide-react'

// ── Formatters ────────────────────────────────────────────────────────────────

const fmtNum = (n: number) => new Intl.NumberFormat('pl-PL').format(Math.round(n))
const fmtPln = (n: number) => `PLN ${fmtNum(n)}`

function toIso(date: string, endOfDay = false) {
  return endOfDay ? `${date}T23:59:59Z` : `${date}T00:00:00Z`
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Loading revenue data…</p>
    </div>
  )
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon: Icon, iconBg, iconColor }: any) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex items-start gap-4">
      <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon size={17} className={iconColor} strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium mb-0.5">{title}</p>
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── Filter Bar ────────────────────────────────────────────────────────────────

function FilterBar({ startDate, endDate, setStartDate, setEndDate, today, last30, last7 }: any) {
  const presets = [
    { label: 'Jan–Mar 2026', s: '2026-01-01', e: '2026-03-31' },
    { label: 'Last 30d',     s: last30,        e: today },
    { label: 'Last 7d',      s: last7,         e: today },
    { label: 'This Year',    s: '2026-01-01',  e: today },
    { label: '2025 Full',    s: '2025-01-01',  e: '2025-12-31' },
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

const CHART_COLORS = ['#7C3AED', '#F97316', '#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#EC4899', '#06B6D4']

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RevenueUnits() {
  const today  = new Date().toISOString().slice(0, 10)
  const last30 = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10)
  const last7  = new Date(Date.now() - 7  * 864e5).toISOString().slice(0, 10)

  const [startDate, setStartDate] = useState('2026-01-01')
  const [endDate, setEndDate]     = useState(today)
  const [sortField, setSortField] = useState<'totalNetSales' | 'totalGrossSales' | 'totalProfit' | 'totalQuantity'>('totalNetSales')

  const dateParams = {
    DateFrom: toIso(startDate, false),
    DateTo:   toIso(endDate, true),
  }

  const { data: summary, loading: summLoading, error: summError } = useSalesSummary(dateParams)
  const { data: statsPage, loading: statsLoading } = useProductsSalesStatistics({
    Page: 1, PageSize: 100,
    SortBy: sortField, SortOrder: 'desc',
    ...dateParams,
  })

  const loading = summLoading || statsLoading

  const products = (statsPage?.items ?? []).filter(p => (p.totalNetSales ?? 0) > 0)

  const top8 = products.slice(0, 8).map(p => ({
    name: (p.productName ?? p.productSymbol ?? '').slice(0, 20),
    'Net Sales':  Math.round(p.totalNetSales  ?? 0),
    'Gross Sales': Math.round(p.totalGrossSales ?? 0),
    'Profit':     Math.round(p.totalProfit    ?? 0),
    'Cost':       Math.round(p.totalCost      ?? 0),
  }))

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Revenue & Units</h1>
        <p className="text-xs text-gray-400 mt-0.5">Sales data from Subiekt ERP</p>
      </div>

      {/* Date filter */}
      <FilterBar
        startDate={startDate} endDate={endDate}
        setStartDate={setStartDate} setEndDate={setEndDate}
        today={today} last30={last30} last7={last7}
      />

      {/* Error */}
      {summError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
          ⚠️ Subiekt API error: {summError}
        </div>
      )}

      {/* KPI cards */}
      {loading && !summary ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <KpiCard
            title="Gross Sales"
            value={summary?.totalGrossSales ? fmtPln(summary.totalGrossSales) : '—'}
            sub="Incl. VAT"
            icon={DollarSign} iconBg="bg-green-50" iconColor="text-green-600"
          />
          <KpiCard
            title="Net Sales"
            value={summary?.totalNetSales ? fmtPln(summary.totalNetSales) : '—'}
            sub="Excl. VAT"
            icon={TrendingUp} iconBg="bg-blue-50" iconColor="text-blue-500"
          />
          <KpiCard
            title="Units Sold"
            value={summary?.totalQuantity ? fmtNum(summary.totalQuantity) : '—'}
            sub="All products"
            icon={Package} iconBg="bg-indigo-50" iconColor="text-indigo-500"
          />
          <KpiCard
            title="Gross Profit"
            value={summary?.totalProfit ? fmtPln(summary.totalProfit) : '—'}
            sub="Net Sales − Cost"
            icon={TrendingUp} iconBg="bg-pink-50" iconColor="text-pink-500"
          />
          <KpiCard
            title="Total Cost (COGS)"
            value={summary?.totalCost ? fmtPln(summary.totalCost) : '—'}
            sub="Warehouse cost of goods sold"
            icon={CreditCard} iconBg="bg-amber-50" iconColor="text-amber-500"
          />
          <KpiCard
            title="Avg Profit Margin"
            value={summary?.averageProfitMarginPercent ? `${summary.averageProfitMarginPercent.toFixed(2)}%` : '—'}
            sub="From API"
            icon={Percent} iconBg="bg-orange-50" iconColor="text-orange-500"
          />
        </div>
      )}

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">Top 8 Products — Sales Breakdown</h3>
        <p className="text-xs text-gray-400 mb-4">{startDate} → {endDate}</p>
        {statsLoading ? (
          <Spinner />
        ) : top8.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={top8} layout="vertical" barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => fmtNum(v)} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#6B7280', fontSize: 10 }}
                axisLine={false} tickLine={false} width={120} />
              <Tooltip
                formatter={(v: number, name: string) => [fmtPln(v), name]}
                contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Net Sales"   fill="#7C3AED" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Cost"        fill="#F59E0B" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Profit"      fill="#10B981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-300 text-sm">
            No data for this period
          </div>
        )}
      </div>

      {/* Product breakdown table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Product Breakdown</h3>
            <p className="text-xs text-gray-400 mt-0.5">{products.length} products with sales in period</p>
          </div>
          <div className="flex items-center gap-1.5">
            <ArrowUpDown size={12} className="text-gray-400" />
            <span className="text-xs text-gray-400">Sort by:</span>
            {(['totalNetSales', 'totalGrossSales', 'totalProfit', 'totalQuantity'] as const).map(f => (
              <button key={f} onClick={() => setSortField(f)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  sortField === f
                    ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-purple-400 hover:text-purple-600'
                }`}>
                {f === 'totalNetSales' ? 'Net Sales'
                  : f === 'totalGrossSales' ? 'Gross Sales'
                  : f === 'totalProfit' ? 'Profit'
                  : 'Units'}
              </button>
            ))}
          </div>
        </div>

        {statsLoading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">SKU</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Units</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Net Sales</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Gross Sales</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cost</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Profit</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p, i) => {
                  const margin = p.averageProfitMarginPercent ?? 0
                  return (
                    <tr key={p.productSymbol ?? i} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-5 text-xs text-gray-400 tabular-nums">{i + 1}</td>
                      <td className="py-3 px-4 text-gray-900 font-medium max-w-[200px] truncate">
                        {p.productName ?? p.productSymbol ?? '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {p.productSymbol ?? '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700 tabular-nums">{fmtNum(p.totalQuantity ?? 0)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900 tabular-nums">{fmtPln(p.totalNetSales ?? 0)}</td>
                      <td className="py-3 px-4 text-right text-gray-700 tabular-nums">{fmtPln(p.totalGrossSales ?? 0)}</td>
                      <td className="py-3 px-4 text-right text-amber-600 tabular-nums">{fmtPln(p.totalCost ?? 0)}</td>
                      <td className="py-3 px-4 text-right tabular-nums">
                        <span className={(p.totalProfit ?? 0) >= 0 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                          {fmtPln(p.totalProfit ?? 0)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          margin >= 20 ? 'bg-green-50 text-green-600'
                          : margin >= 10 ? 'bg-amber-50 text-amber-600'
                          : 'bg-red-50 text-red-500'
                        }`}>
                          {margin.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {products.length === 0 && !statsLoading && (
              <div className="text-center text-gray-400 text-sm py-12">No sales data for this period</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
