import { useAPI, getOrdersToday, getMarketplaceBreakdown } from '../lib/api'
import { useState } from 'react'

function useOrdersByDate(dateFrom: string, dateTo: string) {
  return useAPI(
    () => fetch(`/api/v1/marketplace/orders/summary?days=30`).then(r => r.json()),
    [dateFrom, dateTo]
  )
}

export default function Marketplaces() {
  const today = new Date().toISOString().slice(0, 10)
  const [startDate, setStartDate] = useState(`${new Date().getFullYear()}-01-01`)
  const [endDate, setEndDate] = useState(today)
  const [period, setPeriod] = useState(30)

  const { data: todayData, loading, error } = useAPI(getOrdersToday)
  const { data: breakdown } = useAPI(() => getMarketplaceBreakdown(period), [period])

  const channels = todayData?.by_channel ?? {}
  const channelBreakdown = breakdown?.channels ?? {}

  const fmtEur = (n: number) => `€${(n ?? 0).toLocaleString('en', { maximumFractionDigits: 0 })}`

  if (loading) return <div className="p-6 text-gray-500 animate-pulse">Loading marketplace data...</div>

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {error && <div className="bg-amber-900/30 border border-amber-600 rounded-lg p-3 text-amber-400 text-sm">⚠️ Backend offline</div>}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Marketplaces</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500">Revenue period:</span>
          {[7, 14, 30, 60, 90].map(d => (
            <button key={d} onClick={() => setPeriod(d)}
              className={`px-3 py-1.5 rounded-lg border transition ${period === d ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-gray-200 text-gray-500 hover:border-indigo-600 hover:text-white'}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Today summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border shadow-sm border-gray-200">
          <div className="text-gray-500 text-sm mb-1">Orders Today ({todayData?.date})</div>
          <div className="text-3xl font-bold text-white">{todayData?.total_orders ?? 0}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border shadow-sm border-gray-200">
          <div className="text-gray-500 text-sm mb-1">Revenue Today</div>
          <div className="text-3xl font-bold text-white">{fmtEur(todayData?.total_revenue_eur ?? 0)}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border shadow-sm border-gray-200">
          <div className="text-gray-500 text-sm mb-1">Total in Shopify</div>
          <div className="text-3xl font-bold text-white">{(todayData?.shopify_total ?? 0).toLocaleString()}</div>
          <div className="text-gray-400 text-xs mt-1">All orders ever</div>
        </div>
        <div className="bg-white rounded-xl p-5 border shadow-sm border-gray-200">
          <div className="text-gray-500 text-sm mb-1">Active Channels</div>
          <div className="text-3xl font-bold text-white">{Object.keys(channels).length}</div>
        </div>
      </div>

      {/* Today by channel */}
      <div className="bg-white rounded-xl p-5 border shadow-sm border-gray-200">
        <h3 className="text-white font-semibold mb-4">Today's Orders by Channel</h3>
        {Object.keys(channels).length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(channels)
              .sort((a: any, b: any) => b[1].revenue_eur - a[1].revenue_eur)
              .map(([name, v]: any) => (
              <div key={name} className="bg-gray-50 rounded-lg p-4">
                <div className="text-gray-500 text-xs capitalize mb-1">{name.replace(/_/g,' ')}</div>
                <div className="text-white font-bold text-xl">{v.orders}</div>
                <div className="text-gray-700 text-sm">{fmtEur(v.revenue_eur ?? 0)}</div>
                {v.cancelled != null && v.cancelled > 0 && (
                  <div className="text-red-400 text-xs">{v.cancelled} cancelled</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 py-4 text-sm text-center">
            {error ? 'Backend offline — start backend to see orders' : 'No orders synced yet today'}
          </div>
        )}
      </div>

      {/* Revenue share chart */}
      <div className="bg-white rounded-xl p-5 border shadow-sm border-gray-200">
        <h3 className="text-white font-semibold mb-4">{period}-Day Revenue Share by Channel</h3>
        {Object.keys(channelBreakdown).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(channelBreakdown)
              .sort((a: any, b: any) => b[1].revenue - a[1].revenue)
              .map(([name, v]: any) => (
              <div key={name} className="flex items-center gap-4">
                <div className="text-gray-700 text-sm capitalize w-36">{name.replace(/_/g,' ')}</div>
                <div className="flex-1 bg-gray-50 rounded-full h-4 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-600" style={{ width: `${v.pct ?? 0}%` }} />
                </div>
                <div className="text-gray-700 font-bold text-sm w-14 text-right">{(v.pct ?? 0).toFixed(1)}%</div>
                <div className="text-gray-500 text-sm w-28 text-right">{fmtEur(v.revenue ?? 0)}</div>
                <div className="text-gray-400 text-xs w-16 text-right">{v.orders} orders</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-sm text-center py-4">No revenue data</div>
        )}
        <p className="text-gray-500 text-xs mt-4">Source: Shopify (BaseLinker sync) — all marketplace orders via Shopify</p>
      </div>
    </div>
  )
}
