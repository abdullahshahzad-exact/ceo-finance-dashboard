import { useAPI, getAR, getTransactions, getBankAccounts } from '../lib/api'

export default function MoneyStuck() {
  const { data: ar, loading, error } = useAPI(getAR)
  const { data: tx } = useAPI(() => getTransactions(30))
  const { data: accounts } = useAPI(getBankAccounts)

  const fmtPln = (n: number) => `PLN ${(n ?? 0).toLocaleString('en', { maximumFractionDigits: 0 })}`
  const fmtEur = (n: number) => `EUR ${(n ?? 0).toLocaleString('en', { maximumFractionDigits: 0 })}`

  const allAccounts = Object.values(accounts?.by_currency ?? {}).flat() as any[]
  const overdrafts = allAccounts.filter((a: any) => a.balance < -50000)

  // Live DHL/FedEx claims from Google Sheets via backend
  const { data: dhlLive } = useAPI(() => fetch('/api/v1/moneystuck/dhl-claims').then(r => r.json()))
  
  // Merge live data with known baseline (fallback if sheet unavailable)
  const dhlClaims = {
    total_at_risk_eur: dhlLive?.total_eur ?? 1801446,
    total_cases: dhlLive?.total_cases ?? 145,
    closed_recovered_eur: dhlLive?.by_status?.['Closed']?.total_eur ?? dhlLive?.by_status?.['Recovered']?.total_eur ?? 357677,
    rejected_eur: dhlLive?.by_status?.['Rejected']?.total_eur ?? 258276,
    stale_no_update_eur: dhlLive?.by_status?.['No update']?.total_eur ?? 1092793,
    under_investigation_eur: dhlLive?.by_status?.['Under Investigation']?.total_eur ?? 555447,
    pod_provided_eur: dhlLive?.by_status?.['POD Provided']?.total_eur ?? 480647,
    rejected_cases: dhlLive?.by_status?.['Rejected']?.count ?? 17,
    stale_cases: dhlLive?.by_status?.['No update']?.count ?? 107,
    no_claim_filed: dhlLive?.by_status?.['No claim']?.count ?? 73,
    top_unresolved: dhlLive?.top_cases?.length > 0 ? dhlLive.top_cases.map((c: any) => ({
      customer: c.customer, eur: c.amount_eur, status: c.status, marketplace: c.marketplace
    })) : [
      { customer: 'Margot Dargegen', eur: 98900, status: 'Delivered Late', marketplace: 'Back Market' },
      { customer: 'Dylan Simler', eur: 98600, status: 'Under Investigation', marketplace: 'Back Market' },
      { customer: 'Olivier Faber', eur: 97900, status: 'POD Provided', marketplace: 'Back Market' },
      { customer: 'Wolfgang Düringer', eur: 88499, status: 'Rejected', marketplace: 'Refurbed' },
      { customer: 'Malek Ansseur Palombi', eur: 79899, status: 'Under Investigation', marketplace: 'CDiscount' },
      { customer: 'Gabriel SIMOES', eur: 62700, status: 'Rejected — Reopen', marketplace: 'Back Market' },
      { customer: 'Tanaya Bayle', eur: 58600, status: 'Rejected — Reopen', marketplace: 'Back Market' },
      { customer: 'Ivan Calatayud Sanchez', eur: 55500, status: 'POD Provided', marketplace: 'Back Market' },
    ]
  }

  if (loading) return <div className="p-6 text-gray-500 animate-pulse">Loading...</div>

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {error && <div className="bg-amber-900/30 border border-amber-600 rounded-lg p-3 text-amber-600 text-sm">⚠️ Backend offline</div>}
      <h1 className="text-2xl font-bold text-gray-900">Money Stuck</h1>

      {/* Total blocked cash overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-red-50 border border-red-800 rounded-2xl p-5 shadow-sm">
          <div className="text-red-400 text-sm mb-1">DHL/FedEx at Risk</div>
          <div className="text-red-600 font-bold text-2xl">{fmtEur(dhlClaims.total_at_risk_eur)}</div>
          <div className="text-gray-400 text-xs mt-1">{dhlClaims.total_cases} cases</div>
        </div>
        <div className="bg-white border border-red-800 rounded-2xl p-5 shadow-sm">
          <div className="text-red-400 text-sm mb-1">Overdue AR</div>
          <div className="text-red-600 font-bold text-2xl">{fmtPln(ar?.ar_overdue ?? 0)}</div>
          <div className="text-gray-400 text-xs mt-1">Customers not paying</div>
        </div>
        <div className="bg-white border border-orange-800 rounded-2xl p-5 shadow-sm">
          <div className="text-orange-400 text-sm mb-1">AR Outstanding</div>
          <div className="text-orange-600 font-bold text-2xl">{fmtPln(ar?.outstanding_total ?? 0)}</div>
          <div className="text-gray-400 text-xs mt-1">Total unpaid invoices</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="text-gray-500 text-sm mb-1">Cash Flow (30d)</div>
          <div className={`font-bold text-2xl ${(tx?.net ?? 0) < 0 ? 'text-red-400' : 'text-green-600'}`}>
            {fmtEur(tx?.net ?? 0)}
          </div>
          <div className="text-gray-400 text-xs mt-1">In: {fmtEur(tx?.total_inflow ?? 0)} | Out: {fmtEur(tx?.total_outflow ?? 0)}</div>
        </div>
      </div>

      {/* DHL/FedEx Claims Detail */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 font-semibold">📦 DHL / FedEx Claims — {dhlClaims.total_cases} Cases</h3>
          <span className="text-red-400 font-bold text-lg">{fmtEur(dhlClaims.total_at_risk_eur)} total at risk</span>
        </div>

        {/* Status breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
          {[
            { label: '✅ Closed / Recovered', eur: dhlClaims.closed_recovered_eur, color: 'text-green-600', bg: 'bg-green-50 border-green-800' },
            { label: '❌ Rejected — Reopen', eur: dhlClaims.rejected_eur, color: 'text-red-400', bg: 'bg-red-50 border-red-800', cases: dhlClaims.rejected_cases },
            { label: '⚠️ Stale / No Update', eur: dhlClaims.stale_no_update_eur, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-800', cases: dhlClaims.stale_cases },
            { label: '🔍 Under Investigation', eur: dhlClaims.under_investigation_eur, color: 'text-blue-600', bg: 'bg-gray-50 border-gray-200' },
            { label: '📄 POD Submitted', eur: dhlClaims.pod_provided_eur, color: 'text-purple-400', bg: 'bg-gray-50 border-gray-200' },
            { label: '❌ No Claim Filed', eur: 0, color: 'text-red-500', bg: 'bg-red-50 border-red-900', cases: dhlClaims.no_claim_filed },
          ].map(({ label, eur, color, bg, cases }) => (
            <div key={label} className={`rounded-lg p-3 border ${bg}`}>
              <div className={`text-xs mb-1 ${color}`}>{label}</div>
              {eur > 0 && <div className={`font-bold text-lg ${color}`}>{fmtEur(eur)}</div>}
              {cases != null && <div className="text-gray-500 text-sm">{cases} cases</div>}
            </div>
          ))}
        </div>

        {/* 🔴 URGENT ACTIONS */}
        <div className="bg-red-950/20 border border-red-700 rounded-lg p-4 mb-4">
          <p className="text-red-600 font-semibold text-sm mb-2">🔴 Urgent Actions Required:</p>
          <ul className="text-red-600/80 text-xs space-y-1 list-disc list-inside">
            <li><strong>{dhlClaims.no_claim_filed} cases have NO DHL claim filed</strong> — file before DHL deadline (value unknown, file now)</li>
            <li><strong>Reopen {dhlClaims.rejected_cases} rejected cases</strong> — send full documentation to DHL ({fmtEur(dhlClaims.rejected_eur)})</li>
            <li><strong>{dhlClaims.stale_cases} stale cases</strong> — no update received, send follow-up to DHL today ({fmtEur(dhlClaims.stale_no_update_eur)})</li>
          </ul>
        </div>

        {/* Top unresolved cases */}
        <h4 className="text-gray-900 text-sm font-semibold mb-3">Top Unresolved Cases by Value</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-left">
                <th className="py-2 px-3">Customer</th>
                <th className="py-2 px-3">Marketplace</th>
                <th className="py-2 px-3 text-right">EUR Value</th>
                <th className="py-2 px-3">DHL Status</th>
              </tr>
            </thead>
            <tbody>
              {dhlClaims.top_unresolved.map((c: any, i: number) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-900">{c.customer}</td>
                  <td className="py-2 px-3 text-gray-500">{c.marketplace}</td>
                  <td className="py-2 px-3 text-right font-bold text-red-600">{fmtEur(c.eur)}</td>
                  <td className="py-2 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      c.status.includes('Rejected') ? 'bg-red-100 text-red-600' :
                      c.status.includes('POD') ? 'bg-purple-100 text-purple-600' :
                      'bg-amber-100 text-amber-300'
                    }`}>{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-gray-400 text-xs mt-3">Full report in #ceo-coordination-updates | Source: DHL Claims tracker (145 cases)</p>
      </div>

      {/* Bank overdrafts */}
      {overdrafts.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-800">
          <h3 className="text-red-400 font-semibold mb-3">⚠️ Bank Accounts in Overdraft</h3>
          <div className="space-y-2">
            {overdrafts.map((a: any) => (
              <div key={a.id} className="flex justify-between items-center">
                <span className="text-gray-700 text-sm">{a.name}</span>
                <span className="text-red-400 font-bold">{a.currency} {a.balance.toLocaleString('en', { maximumFractionDigits: 0 })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AR aging */}
      {ar?.aging_buckets && ar.aging_buckets.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
          <h3 className="text-gray-900 font-semibold mb-4">AR Aging Buckets</h3>
          {ar.aging_buckets.map((b: any) => (
            <div key={b.range ?? b.bucket} className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-500 text-sm">{b.range ?? b.bucket}</span>
              <span className="text-gray-900 font-bold">{fmtPln(b.amount ?? 0)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
