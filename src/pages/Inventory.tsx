import { useState } from 'react'
import { useProducts, useSalesSummary } from '../lib/subiekt'
import { Package, TrendingUp, Percent, Search, ChevronLeft, ChevronRight } from 'lucide-react'

const fmtNum = (n: number) => new Intl.NumberFormat('pl-PL').format(Math.round(n))
const fmtPln = (n: number) => `PLN ${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Loading products…</p>
    </div>
  )
}

function KpiTile({ label, value, sub, color = 'text-gray-900', icon: Icon, iconBg }: any) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex items-start gap-4">
      <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon size={17} className={color} strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
        <p className={`text-xl font-bold leading-tight ${color}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function Inventory() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data: products, loading: prodLoading, error: prodError } = useProducts(page, 50)
  const { data: summary, loading: summLoading } = useSalesSummary()

  const loading = prodLoading || summLoading

  const items = (products?.items ?? []).filter(
    (p) =>
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.symbol?.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = products?.totalPages ?? 1

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
        <p className="text-xs text-gray-400 mt-0.5">Product catalogue from Subiekt ERP</p>
      </div>

      {/* Error */}
      {prodError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
          ⚠️ Subiekt API error: {prodError}
        </div>
      )}

      {/* KPI tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiTile
          label="Total Products"
          value={products?.totalCount != null ? fmtNum(products.totalCount) : '—'}
          sub="In Subiekt ERP"
          icon={Package}
          iconBg="bg-purple-50"
          color="text-purple-600"
        />
        <KpiTile
          label="Total Units Sold"
          value={summary?.totalQuantity != null ? fmtNum(summary.totalQuantity) : '—'}
          sub="All time"
          icon={TrendingUp}
          iconBg="bg-green-50"
          color="text-green-600"
        />
        <KpiTile
          label="Net Sales"
          value={summary?.totalNetSales != null ? fmtPln(summary.totalNetSales) : '—'}
          sub="Excl. VAT"
          icon={TrendingUp}
          iconBg="bg-blue-50"
          color="text-blue-600"
        />
        <KpiTile
          label="Avg Profit Margin"
          value={summary?.averageProfitMarginPercent != null
            ? `${summary.averageProfitMarginPercent.toFixed(2)}%`
            : '—'}
          sub="From API"
          icon={Percent}
          iconBg="bg-orange-50"
          color="text-orange-500"
        />
      </div>

      {/* Product table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Table header bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">
            All Products
            {products?.totalCount != null && (
              <span className="ml-2 text-xs font-normal text-gray-400">
                ({fmtNum(products.totalCount)} total)
              </span>
            )}
          </h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={2} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search name or SKU…"
              className="pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-purple-400 w-56"
            />
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <Spinner />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product Name</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">SKU</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Net Price</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">VAT</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">UOM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((p) => (
                    <tr key={p.symbol} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-5 text-gray-900 font-medium max-w-xs truncate">{p.name}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {p.symbol}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900 tabular-nums">
                        {fmtPln(p.netPrice)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                          {p.tax}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-xs text-gray-500">{p.uom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {items.length === 0 && !loading && (
                <div className="text-center text-gray-400 text-sm py-12">No products found</div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-purple-400 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={13} /> Previous
                </button>
                <span className="text-xs text-gray-400">
                  Page <span className="font-semibold text-gray-700">{page}</span> of <span className="font-semibold text-gray-700">{totalPages}</span>
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-purple-400 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
