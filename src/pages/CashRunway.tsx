import { useAPI, getCashSummary, getCashflow, getBankAccounts } from '../lib/api'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function CashRunway() {
  const { data: cash, loading, error } = useAPI(getCashSummary)
  const { data: cfRaw } = useAPI(getCashflow)
  const { data: accounts } = useAPI(getBankAccounts)

  const cfData = (() => {
    const pts = cfRaw?.points ?? []
    return pts.filter((p: any) => p.currency === 'EUR').slice(-30).map((p: any) => ({
      date: (p.date ?? '').slice(5),
      inflow: Math.round(p.inflow ?? 0),
      outflow: Math.round(Math.abs(p.outflow ?? 0)),
      net: Math.round(p.net_flow ?? 0),
    }))
  })()

  const byCurrency = cash?.by_currency ?? {}

  // Flatten all accounts grouped by currency
  const allAccounts = accounts?.by_currency
    ? Object.entries(accounts.by_currency).flatMap(([ccy, accs]: any) =>
        accs.map((a: any) => ({ ...a, currency: ccy }))
      )
    : []

  const fmtBal = (n: number, ccy: string) => {
    const abs = Math.abs(n)
    const fmt = abs >= 1000000
      ? `${ccy} ${(abs / 1000000).toFixed(2)}M`
      : abs >= 1000
      ? `${ccy} ${(abs / 1000).toFixed(1)}K`
      : `${ccy} ${abs.toLocaleString('en', { maximumFractionDigits: 0 })}`
    return n < 0 ? `-${fmt}` : fmt
  }

  if (loading) return <div className="p-6 text-gray-500 ">Loading cash data...</div>

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {error && <div className="bg-amber-900/30 border border-amber-600 rounded-lg p-3 text-amber-600 text-sm">⚠️ Backend offline — run uvicorn on port 8001</div>}
      <h1 className="text-2xl font-bold text-gray-900">Cash & Runway</h1>

      {/* Currency totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(byCurrency).map(([ccy, d]: any) => (
          <div key={ccy} className={`rounded-2xl p-5 border shadow-sm ${d.balance < 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
            <div className={`text-sm mb-1 font-semibold ${d.balance < 0 ? 'text-red-400' : 'text-gray-500'}`}>{ccy} Total</div>
            <div className={`text-2xl font-bold ${d.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {fmtBal(d.balance, ccy)}
            </div>
            <div className="text-gray-400 text-xs mt-1">Available: {fmtBal(d.available ?? 0, ccy)}</div>
            <div className="text-gray-400 text-xs">{d.accounts} accounts</div>
          </div>
        ))}
      </div>

      {/* Individual bank accounts */}
      {allAccounts.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border shadow-sm border-gray-200">
          <h3 className="text-gray-900 font-semibold mb-4">All Bank Accounts ({allAccounts.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-left">
                  <th className="py-2 px-3">Account Name</th>
                  <th className="py-2 px-3">Account Number</th>
                  <th className="py-2 px-3">Currency</th>
                  <th className="py-2 px-3 text-right">Balance</th>
                  <th className="py-2 px-3 text-right">Available</th>
                  <th className="py-2 px-3 text-right">Change</th>
                </tr>
              </thead>
              <tbody>
                {allAccounts
                  .filter((a: any) => !a.is_closed)
                  .sort((a: any, b: any) => Math.abs(b.balance) - Math.abs(a.balance))
                  .map((a: any) => {
                    const change = (a.balance ?? 0) - (a.prev_balance ?? a.balance ?? 0)
                    return (
                      <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-3 text-gray-900 font-medium">{a.name}</td>
                        <td className="py-3 px-3 text-gray-400 font-mono text-xs">
                          {(a.number ?? '').slice(-8) ? `...${(a.number ?? '').slice(-8)}` : '—'}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            a.currency === 'EUR' ? 'bg-blue-900/40 text-blue-300' :
                            a.currency === 'PLN' ? 'bg-purple-900/40 text-purple-300' :
                            a.currency === 'USD' ? 'bg-green-900/40 text-green-300' :
                            'bg-amber-900/40 text-amber-300'
                          }`}>{a.currency}</span>
                        </td>
                        <td className={`py-3 px-3 text-right font-bold ${(a.balance ?? 0) < 0 ? 'text-red-400' : 'text-gray-900'}`}>
                          {fmtBal(a.balance ?? 0, a.currency)}
                        </td>
                        <td className="py-3 px-3 text-right text-gray-700">
                          {fmtBal(a.available ?? 0, a.currency)}
                        </td>
                        <td className={`py-3 px-3 text-right text-xs ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                          {change !== 0 ? (change > 0 ? '+' : '') + fmtBal(change, a.currency) : '—'}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cash flow chart */}
      <div className="bg-white rounded-2xl p-5 border shadow-sm border-gray-200">
        <h3 className="text-gray-900 font-semibold mb-4">Daily Cash Flow EUR (last 30 days)</h3>
        {cfData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={cfData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3f55" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `€${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => [`€${v.toLocaleString()}`, '']} contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8 }} />
              <Legend />
              <Area type="monotone" dataKey="inflow" stroke="#059669" fill="#059669" fillOpacity={0.15} strokeWidth={2} name="Inflow" />
              <Area type="monotone" dataKey="outflow" stroke="#dc2626" fill="#dc2626" fillOpacity={0.15} strokeWidth={2} name="Outflow" />
              <Area type="monotone" dataKey="net" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.1} strokeWidth={2} name="Net" strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">No cashflow data — start backend</div>
        )}
      </div>
    </div>
  )
}
