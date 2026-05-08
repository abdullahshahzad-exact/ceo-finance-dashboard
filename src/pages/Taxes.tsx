import { useAPI, getKpi } from '../lib/api'
import { useState } from 'react'

function useVAT(dateFrom: string, dateTo: string) {
  return useAPI(() => fetch(`/api/v1/financials/vat-summary?date_from=${dateFrom}&date_to=${dateTo}`).then(r => r.json()), [dateFrom, dateTo])
}
function useOSS(dateFrom: string, dateTo: string) {
  return useAPI(() => fetch(`/api/v1/financials/oss-summary?date_from=${dateFrom}&date_to=${dateTo}`).then(r => r.json()), [dateFrom, dateTo])
}

const FLAG: Record<string, string> = {
  DE:'🇩🇪',FR:'🇫🇷',IT:'🇮🇹',ES:'🇪🇸',NL:'🇳🇱',BE:'🇧🇪',SE:'🇸🇪',DK:'🇩🇰',
  FI:'🇫🇮',AT:'🇦🇹',PT:'🇵🇹',CZ:'🇨🇿',SK:'🇸🇰',HU:'🇭🇺',RO:'🇷🇴',BG:'🇧🇬',
  HR:'🇭🇷',SI:'🇸🇮',EE:'🇪🇪',LV:'🇱🇻',LT:'🇱🇹',LU:'🇱🇺',IE:'🇮🇪',GR:'🇬🇷',
  CY:'🇨🇾',MT:'🇲🇹',PL:'🇵🇱',CH:'🇨🇭',NO:'🇳🇴',GB:'🇬🇧',
}

export default function Taxes() {
  const { data: kpi, error } = useAPI(getKpi)
  const [period, setPeriod] = useState('2026-03')
  const { data: dhlData } = useAPI(() => fetch('/api/v1/moneystuck/dhl-claims').then(r => r.json()))
  const [dateFrom, dateTo] = (() => {
    const [y = 2026, m = 1] = period.split('-').map(Number)
    const last = new Date(y, m, 0).getDate()
    return [`${y}-${String(m).padStart(2,'0')}-01`, `${y}-${String(m).padStart(2,'0')}-${last}`]
  })()
  const { data: vat, loading: vatLoad } = useVAT(dateFrom, dateTo)
  const { data: oss, loading: ossLoad } = useOSS(dateFrom, dateTo)
  const loading = vatLoad || ossLoad

  const fmtPln = (n: number) => `PLN ${(n ?? 0).toLocaleString('en', { maximumFractionDigits: 0 })}`
  const fmtEur = (n: number) => `EUR ${(n ?? 0).toLocaleString('en', { maximumFractionDigits: 0 })}`

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {error && <div className="bg-amber-900/30 border border-amber-600 rounded-lg p-3 text-amber-600 text-sm">⚠️ Backend offline</div>}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">VAT / OSS / CIT</h1>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-sm">Period:</span>
          <input type="month" value={period} onChange={e => setPeriod(e.target.value)}
            className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg px-3 py-2" />
        </div>
      </div>

      {/* VAT Summary */}
      <div className="bg-white rounded-2xl p-5 border shadow-sm border-gray-200">
        <h3 className="text-gray-900 font-semibold mb-4">VAT Summary — {period}</h3>
        {vatLoad ? <div className="text-gray-500 text-sm ">Loading VAT...</div> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'VAT Collected (Output)', value: vat?.vat_collected_pln ?? 0, color: 'text-gray-900' },
              { label: 'VAT on Purchases (Input)', value: vat?.vat_purchases_pln ?? 0, color: 'text-green-600' },
              { label: 'VAT Corrections', value: vat?.vat_corrections_pln ?? 0, color: 'text-amber-600' },
              { label: '🔴 Net VAT to Pay', value: vat?.net_vat_liability_pln ?? 0, color: 'text-red-600', big: true },
            ].map(({ label, value, color, big }) => (
              <div key={label} className={`bg-gray-50 rounded-lg p-4 ${big ? 'border border-red-200' : ''}`}>
                <div className="text-gray-500 text-xs mb-1">{label}</div>
                <div className={`font-bold ${big ? 'text-xl' : 'text-lg'} ${color}`}>{fmtPln(value)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* OSS by Country */}
      <div className="bg-white rounded-2xl p-5 border shadow-sm border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 font-semibold">🇪🇺 OSS — Sales by EU Country</h3>
          {oss && <span className="text-gray-500 text-sm">Total OSS VAT: <strong className="text-red-600">{fmtPln(oss.total_oss_vat_pln)}</strong></span>}
        </div>
        {ossLoad ? <div className="text-gray-500 text-sm ">Loading OSS data from Subiekt...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-left">
                  <th className="py-2 px-3">Country</th>
                  <th className="py-2 px-3 text-right">Orders</th>
                  <th className="py-2 px-3 text-right">Revenue (EUR)</th>
                  <th className="py-2 px-3 text-right">VAT Rate</th>
                  <th className="py-2 px-3 text-right">VAT Owed (PLN)</th>
                  <th className="py-2 px-3">Type</th>
                </tr>
              </thead>
              <tbody>
                {(oss?.poland_domestic ? [oss.poland_domestic] : []).concat(oss?.oss_countries ?? [])
                  .sort((a: any, b: any) => b.eur_value - a.eur_value)
                  .map((c: any) => (
                  <tr key={c.country_code} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-900 font-medium">
                      {FLAG[c.country_code] ?? '🏳️'} {c.country_name}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-700">{c.orders}</td>
                    <td className="py-2 px-3 text-right text-gray-900 font-mono">{fmtEur(c.eur_value)}</td>
                    <td className="py-2 px-3 text-right">
                      <span className="text-gray-700">{c.vat_rate_pct ? `${c.vat_rate_pct}%` : '—'}</span>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-red-600">{fmtPln(c.vat_pln)}</td>
                    <td className="py-2 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${c.is_oss ? 'bg-blue-900/40 text-blue-300' : 'bg-slate-800 text-gray-500'}`}>
                        {c.is_oss ? 'OSS' : c.country_code === 'PL' ? 'Domestic' : 'Non-EU'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-gray-400 text-xs mt-3">Source: Subiekt invoices ({vat?.total_documents?.toLocaleString()} documents) | Data: {dateFrom} to {dateTo}</p>
      </div>

      {/* DHL Claims */}
      <div className="bg-white rounded-2xl p-5 border shadow-sm border-orange-800">
        <h3 className="text-gray-900 font-semibold mb-4">DHL/FedEx Claims — Cash Flow Impact</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total at Risk', value: dhlData?.total_eur ? `EUR ${(dhlData.total_eur).toLocaleString()}` : 'EUR 1,801,446', color: 'text-red-400' },
            { label: 'Recovered', value: dhlData?.by_status?.['Closed']?.total_eur ? `EUR ${dhlData.by_status['Closed'].total_eur.toLocaleString()}` : 'EUR 357,677', color: 'text-green-600' },
            { label: 'Rejected — Reopen', value: dhlData?.by_status?.['Rejected']?.total_eur ? `EUR ${dhlData.by_status['Rejected'].total_eur.toLocaleString()}` : 'EUR 258,276', color: 'text-red-400' },
            { label: 'Stale / No Update', value: dhlData?.by_status?.['No update']?.total_eur ? `EUR ${dhlData.by_status['No update'].total_eur.toLocaleString()}` : 'EUR 1,092,793', color: 'text-amber-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-4">
              <div className="text-gray-500 text-xs mb-1">{label}</div>
              <div className={`font-bold text-lg ${color}`}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CIT */}
      <div className="bg-white rounded-2xl p-5 border shadow-sm border-gray-200">
        <h3 className="text-gray-900 font-semibold mb-4">CIT Base (from Financial API)</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4"><div className="text-gray-500 text-xs mb-1">Revenue</div><div className="text-gray-900 font-bold text-xl">{fmtPln(kpi?.revenue ?? 0)}</div></div>
          <div className="bg-gray-50 rounded-lg p-4"><div className="text-gray-500 text-xs mb-1">Net Revenue</div><div className="text-gray-900 font-bold text-xl">{fmtPln(kpi?.net_revenue ?? 0)}</div></div>
          <div className="bg-gray-50 rounded-lg p-4"><div className="text-gray-500 text-xs mb-1">Gross Margin</div><div className="text-gray-900 font-bold text-xl">{(kpi?.gross_margin_pct ?? 0).toFixed(1)}%</div></div>
        </div>
      </div>
    </div>
  )
}
