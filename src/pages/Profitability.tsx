import { useState, useMemo } from 'react'
import { useAPI, getPlMonthly } from '../lib/api'
import { useSalesSummary, useAllMarketplacesSummary } from '../lib/subiekt'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

// ── fp_Id marketplace map ─────────────────────────────────────────────────────
// IDs 1-5 are payment terms; 6-19 are marketplaces (dok_KartaId in Subiekt)

const PAYMENT_FORMS: Record<number, string> = {
  1:  'Odroczony 7 dni',
  2:  'Odroczony 14 dni',
  3:  'Za pobraniem',
  4:  'Pobranie',
  5:  'Karta płatnicza',
  6:  'Allegro',
  7:  'Amazon',
  8:  'Back Market',
  9:  'Rue du Commerce',
  10: 'Refurbed',
  11: 'CDiscount',
  12: 'Empik',
  13: 'eBay',
  14: 'ERLI',
  15: 'Kaufland',
  16: 'FNAC',
  17: 'PC Componentes',
  18: 'Pixmania',
  19: 'Stripe',
}

// Commission rates are % of gross sales, from actual marketplace agreements/invoices
const MARKETPLACES = [
  { id: 6,  name: 'Allegro',         rate: 6.3  },
  { id: 7,  name: 'Amazon',          rate: 8.9  },
  { id: 8,  name: 'Back Market',     rate: 5.4  },
  { id: 9,  name: 'Rue du Commerce', rate: 4.4  },
  { id: 10, name: 'Refurbed',        rate: 10.0 },
  { id: 11, name: 'CDiscount',       rate: 8.5  },
  { id: 12, name: 'Empik',           rate: 7.0  },
  { id: 13, name: 'eBay',            rate: 9.5  },
  { id: 14, name: 'ERLI',            rate: 8.0  },
  { id: 15, name: 'Kaufland',        rate: 8.0  },
  { id: 16, name: 'FNAC',            rate: 8.0  },
  { id: 17, name: 'PC Componentes',  rate: 7.0  },
  { id: 18, name: 'Pixmania',        rate: 1.3  },
  { id: 19, name: 'Stripe',          rate: 2.9  },
]
const MARKETPLACE_IDS = MARKETPLACES.map(m => m.id)

const COLORS = [
  '#7c3aed','#2563eb','#059669','#dc2626','#d97706',
  '#0891b2','#7c3aed','#db2777','#65a30d','#ea580c',
  '#6366f1','#14b8a6','#f59e0b','#8b5cf6',
]

// ── Formatters ────────────────────────────────────────────────────────────────

const fmtPln  = (n: number) =>
  `PLN ${Math.round(n ?? 0).toLocaleString('pl-PL')}`
const fmtNum  = (n: number) =>
  Math.round(n ?? 0).toLocaleString('pl-PL')
const fmtPct  = (n: number) =>
  `${(n ?? 0).toFixed(1)}%`

// ── Helpers ───────────────────────────────────────────────────────────────────

function KpiTile({ label, value, sub, color = 'text-gray-900' }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
      <p className={`text-xl font-bold ${color} leading-tight`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function WaterfallRow({ label, value, note, type, bold }: {
  label: string; value: number; note?: string; type?: string; bold?: boolean
}) {
  const isNeg   = value < 0
  const isTotal = type === 'total'
  const isSub   = type === 'subtotal'
  return (
    <div className={`flex justify-between items-center py-2 px-3 rounded-lg ${
      isTotal ? 'bg-indigo-50 border border-indigo-200' :
      isSub   ? 'bg-gray-50 border border-gray-200' : ''
    }`}>
      <div>
        <span className={`text-sm ${bold ? 'font-bold text-gray-900' : isNeg ? 'text-gray-500' : 'text-gray-800'}`}>{label}</span>
        {note && <span className="text-gray-400 text-xs ml-2">{note}</span>}
      </div>
      <span className={`font-bold text-sm tabular-nums ${isNeg ? 'text-red-500' : bold || isTotal ? 'text-gray-900' : 'text-gray-700'}`}>
        {value >= 0 ? '+' : ''}{fmtPln(value)}
      </span>
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Profitability() {
  const thisYear  = new Date().getFullYear()
  const today     = new Date().toISOString().slice(0, 10)
  const [startDate, setStartDate] = useState(`${thisYear}-01-01`)
  const [endDate,   setEndDate]   = useState(today)
  const [docType,   setDocType]   = useState('')   // '' = all types

  // Overall sales summary (Subiekt — uses warehouseValueIssued as cost → real COGS)
  const { data: summary, loading: summaryLoading } = useSalesSummary({
    DateFrom: startDate, DateTo: endDate,
  })

  // Per-marketplace breakdown
  const { data: mkts, loading: mktsLoading } = useAllMarketplacesSummary(
    MARKETPLACE_IDS,
    { DateFrom: startDate, DateTo: endDate, DocumentType: docType || undefined }
  )

  // Monthly trend chart
  const { data: plRaw } = useAPI(() => getPlMonthly(startDate, endDate), [startDate, endDate])

  // ── Compute per-marketplace rows ─────────────────────────────────────────────
  const marketplaceRows = useMemo(() => {
    if (!mkts) return []
    return MARKETPLACES.map((mp, i) => {
      const d = mkts.find(m => m.id === mp.id)?.data
      const grossSales = d?.totalGrossSales ?? 0
      const netSales   = d?.totalNetSales ?? 0
      const qty          = d?.totalQuantity ?? 0
      const commission   = grossSales * mp.rate / 100
      const contribution = netSales - commission
      return { ...mp, grossSales, netSales, qty, commission, contribution, color: COLORS[i % COLORS.length] }
    }).filter(r => r.grossSales > 0 || r.qty > 0)
  }, [mkts])

  // ── Totals ───────────────────────────────────────────────────────────────────
  const totalGross      = summary?.totalGrossSales ?? 0
  const totalNet        = summary?.totalNetSales ?? 0
  const totalQty        = summary?.totalQuantity ?? 0
  const totalCommission = marketplaceRows.reduce((s, r) => s + r.commission, 0)
  const contribution    = totalNet - totalCommission
  const vatEstimate     = totalGross - totalNet

  // ── Chart data ───────────────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    const series = plRaw?.series ?? []
    return (series as any[])
      .map(p => ({
        month:    (p.month ?? '').slice(0, 7),
        revenue:  Math.round(p.Revenue ?? 0),
      }))
      .filter(d => d.revenue > 0)
  }, [plRaw])

  const mktsChartData = useMemo(() =>
    marketplaceRows
      .filter(r => r.netSales > 0)
      .sort((a, b) => b.netSales - a.netSales)
      .map(r => ({ name: r.name, netSales: Math.round(r.netSales), commission: Math.round(r.commission), contribution: Math.round(r.contribution) })),
    [marketplaceRows]
  )

  const isLoading = summaryLoading || mktsLoading

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Profitability</h1>
        <p className="text-xs text-gray-400 mt-0.5">Revenue and commissions from Subiekt GT · per marketplace (fp_Id)</p>
      </div>

      {/* Date range */}
      <div className="flex flex-wrap items-center gap-2 bg-white rounded-xl p-3 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <span className="text-xs text-gray-500 font-medium">Period:</span>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400" />
        <span className="text-xs text-gray-400">→</span>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400" />
        {[
          ['Jan–Mar 26', `${thisYear}-01-01`, `${thisYear}-03-31`],
          [`${thisYear} YTD`, `${thisYear}-01-01`, today],
          ['2025 Full', '2025-01-01', '2025-12-31'],
        ].map(([l, s, e]) => (
          <button key={l} onClick={() => { setStartDate(s as string); setEndDate(e as string) }}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors">{l}</button>
        ))}
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiTile label="Gross Revenue"    value={summaryLoading ? '…' : fmtPln(totalGross)}      sub="incl. VAT"        />
        <KpiTile label="Net Revenue"      value={summaryLoading ? '…' : fmtPln(totalNet)}        sub="excl. VAT"        />
        <KpiTile label="Est. Commissions" value={mktsLoading    ? '…' : fmtPln(totalCommission)} sub="marketplace fees" color="text-orange-600" />
        <KpiTile label="Units Sold"       value={summaryLoading ? '…' : fmtNum(totalQty)}        sub="invoiced items"   />
      </div>

      {/* P&L waterfall */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">P&L Waterfall</h3>
          <p className="text-xs text-gray-400 mt-0.5">Source: Subiekt GT sales documents</p>
        </div>
        <div className="px-5 py-4 space-y-1.5">
          {isLoading ? <Spinner /> : <>
            <WaterfallRow label="Gross Revenue"         value={totalGross}       note={`${fmtNum(totalQty)} units`}    type="total" bold />
            <WaterfallRow label="– VAT (estimated)"     value={-vatEstimate}     note="gross – net"                                    />
            <WaterfallRow label="= Net Revenue"         value={totalNet}                                               type="subtotal" bold />
            <WaterfallRow label="– Est. Commissions"    value={-totalCommission} note="grossSales × rate% per channel"                />
            <WaterfallRow label="= Contribution Margin" value={contribution}     note={totalNet > 0 ? fmtPct(contribution / totalNet * 100) : ''} type="total" bold />
          </>}
        </div>
      </div>

      {/* Marketplace breakdown table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Marketplace Breakdown</h3>
            <p className="text-xs text-gray-400 mt-0.5">fp_Id 6–19 · commission = grossSales × agreed rate</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Doc type:</span>
            <select
              value={docType}
              onChange={e => setDocType(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-purple-400">
              <option value="">All types</option>
              <option value="FS">FS — Faktura Sprzedaży</option>
              <option value="PA">PA — Paragon</option>
              <option value="WZ">WZ — Wydanie Zewnętrzne</option>
              <option value="FSK">FSK — Faktura Korygująca</option>
              <option value="PAK">PAK — Paragon Korygujący</option>
            </select>
          </div>
        </div>
        {mktsLoading ? <Spinner /> : marketplaceRows.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-10">No marketplace data for this period</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Marketplace</th>
                  <th className="text-center px-3 py-3 font-semibold text-gray-500 uppercase tracking-wide">fp_Id</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Units</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Gross Sales</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Net Sales</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Rate</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Commission</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Contribution</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Revenue share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {marketplaceRows.map(r => {
                  const share = totalNet > 0 ? r.netSales / totalNet * 100 : 0
                  return (
                    <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-2.5 text-gray-900 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                          {r.name}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center text-gray-400 font-mono">{r.id}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-gray-700">{fmtNum(r.qty)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-gray-700">{fmtPln(r.grossSales)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-gray-700">{fmtPln(r.netSales)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-gray-400">{r.rate}%</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-orange-600">{fmtPln(r.commission)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                        <span className={r.contribution >= 0 ? 'text-green-600' : 'text-red-500'}>{fmtPln(r.contribution)}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[60px]">
                            <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, share)}%`, background: r.color }} />
                          </div>
                          <span className="text-gray-400 w-9 text-right tabular-nums">{share.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
                  <td className="px-4 py-3 text-gray-900 text-xs">Total</td>
                  <td />
                  <td className="px-4 py-3 text-right tabular-nums text-xs text-gray-700">{fmtNum(totalQty)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-xs text-gray-700">{fmtPln(totalGross)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-xs text-gray-700">{fmtPln(totalNet)}</td>
                  <td />
                  <td className="px-4 py-3 text-right tabular-nums text-xs text-orange-600">{fmtPln(totalCommission)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-xs">
                    <span className={contribution >= 0 ? 'text-green-600' : 'text-red-500'}>{fmtPln(contribution)}</span>
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Charts */}
      {(mktsChartData.length > 0 || chartData.length > 0) && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {/* Per-marketplace chart */}
          {mktsChartData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-4">Net Sales & Contribution by Marketplace</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={mktsChartData} layout="vertical" margin={{ left: 80, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={v => `${(v / 1e6).toFixed(1)}M`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} width={80} />
                  <Tooltip
                    formatter={(v: number) => [`PLN ${v.toLocaleString('pl-PL')}`, '']}
                    contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="netSales"     name="Net Sales"    fill="#7c3aed" radius={[0, 3, 3, 0]} />
                  <Bar dataKey="commission"   name="Commission"   fill="#ea580c" radius={[0, 3, 3, 0]} />
                  <Bar dataKey="contribution" name="Contribution" fill="#059669" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Monthly trend chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-4">Monthly Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={v => `${(v / 1e6).toFixed(1)}M`} />
                  <Tooltip
                    formatter={(v: number) => [`PLN ${v.toLocaleString('pl-PL')}`, '']}
                    contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 11 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#7c3aed" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
