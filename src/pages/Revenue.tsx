import { useAPI, getKpi, getPlMonthly, getCommissions } from '../lib/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function Revenue() {
  const { data: kpi, loading: kLoading, error: kErr } = useAPI(getKpi)
  const { data: plRaw, loading: plLoading } = useAPI(getPlMonthly)
  const { data: comm } = useAPI(getCommissions)

  const loading = kLoading || plLoading

  const plData = (() => {
    const series = plRaw?.series ?? []
    return series.map((p: any) => ({
      month: (p.month ?? '').slice(0, 7),
      revenue: Math.round(p.Revenue ?? p.revenue ?? 0),
      costs: Math.round(p.InventoryPurchases ?? 0),
    })).filter((d: any) => d.revenue > 0)
  })()

  const channels = comm?.by_marketplace ?? []

  if (loading) return <div className="p-6 text-gray-500 animate-pulse">Loading revenue data...</div>

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {kErr && <div className="bg-amber-900/30 border border-amber-600 rounded-lg p-3 text-amber-400 text-sm">⚠️ Backend offline — run uvicorn on port 8001</div>}
      <h1 className="text-2xl font-bold text-white">Revenue & Units</h1>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `PLN ${((kpi?.revenue ?? 0)/1e6).toFixed(1)}M` },
          { label: 'Net Revenue', value: `PLN ${((kpi?.net_revenue ?? 0)/1e6).toFixed(1)}M` },
          { label: 'Gross Margin', value: kpi?.gross_margin_pct ? `${kpi.gross_margin_pct.toFixed(1)}%` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl p-5 border shadow-sm border-gray-200">
            <div className="text-gray-500 text-sm mb-2">{label}</div>
            <div className="text-2xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-5 border shadow-sm border-gray-200">
        <h3 className="text-white font-semibold mb-4">Monthly Revenue vs Costs (PLN)</h3>
        {plData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={plData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3f55" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `${(v/1e6).toFixed(1)}M`} />
              <Tooltip formatter={(v: number) => [`PLN ${v.toLocaleString()}`, '']} contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="revenue" fill="#7c3aed" name="Revenue" radius={[3,3,0,0]} />
              <Bar dataKey="costs" fill="#dc2626" name="Purchases" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="h-64 flex items-center justify-center text-gray-400">No monthly data — start backend</div>}
      </div>
      {channels.length > 0 && (
        <div className="bg-white rounded-xl p-5 border shadow-sm border-gray-200">
          <h3 className="text-white font-semibold mb-4">Commission by Marketplace</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {channels.map((ch: any) => (
              <div key={ch.marketplace} className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-500 text-xs mb-1">{ch.marketplace}</div>
                <div className="text-white font-bold">PLN {(ch.commission ?? 0).toLocaleString()}</div>
                <div className="text-gray-400 text-xs">{ch.order_count} orders</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
