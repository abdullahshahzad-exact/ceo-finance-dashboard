import { useState } from 'react'
import { BookOpen, ChevronRight } from 'lucide-react'
import { useAccountSums } from '../lib/rewizor'

const fmt = (n: number, waluta: string) =>
  `${waluta} ${(n ?? 0).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmtPln = (n: number) =>
  `PLN ${(n ?? 0).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function AccountSums() {
  const [dateFrom,      setDateFrom]      = useState('')
  const [dateTo,        setDateTo]        = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [expanded,      setExpanded]      = useState<Set<string>>(new Set())

  const params = {
    dateFrom:      dateFrom      ? `${dateFrom}T00:00:00Z` : undefined,
    dateTo:        dateTo        ? `${dateTo}T23:59:59Z`   : undefined,
    accountNumber: accountNumber || undefined,
  }

  const { data, loading, error } = useAccountSums(params)
  const items = data ?? []

  const totalWn = items.reduce(
    (sum, acc) => sum + acc.subAccounts.reduce((s, sub) => s + sub.sumaWn, 0),
    0,
  )

  const toggle = (prefix: string) =>
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(prefix) ? next.delete(prefix) : next.add(prefix)
      return next
    })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Account Base Number Sums</h1>
        <p className="text-sm text-gray-500 mt-0.5">KontoPrefix and SumaWn totals with optional date and account filtering</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Date from</label>
            <input
              type="date" value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#7C3AED]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Date to</label>
            <input
              type="date" value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#7C3AED]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Account number</label>
            <input
              type="text" value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              placeholder="e.g. 401, 501…"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#7C3AED] placeholder-gray-300 w-48"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs text-gray-500 mb-1">Total SumaWn (PLN)</p>
            <p className="text-2xl font-bold text-gray-900">{fmtPln(totalWn)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs text-gray-500 mb-1">Accounts</p>
            <p className="text-2xl font-bold text-gray-900">{items.length}</p>
          </div>
        </div>
      )}

      {/* Accordion table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <BookOpen size={15} className="text-[#7C3AED]" strokeWidth={1.8} />
          <span className="font-medium text-sm text-gray-900">Account Sums</span>
          {items.length > 0 && (
            <span className="ml-auto text-xs text-gray-400">{items.length} accounts</span>
          )}
        </div>

        {loading && (
          <div className="px-5 py-8 text-center text-sm text-gray-400">Loading…</div>
        )}
        {error && (
          <div className="px-5 py-8 text-center text-sm text-red-500">{error}</div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-gray-400">No data found.</div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="divide-y divide-gray-50">
            {/* Header */}
            <div className="grid grid-cols-[32px_1fr_auto] gap-2 px-5 py-2.5 bg-gray-50 text-xs font-medium text-gray-500">
              <span />
              <span>KontoPrefix</span>
              <span className="text-right pr-1">SumaWn</span>
            </div>

            {items.map(acc => {
              const open = expanded.has(acc.kontoPrefix)
              const prefixTotal = acc.subAccounts.reduce((s, sub) => s + sub.sumaWn, 0)
              const currencies = [...new Set(acc.subAccounts.map(s => s.waluta))].join(' / ')

              return (
                <div key={acc.kontoPrefix}>
                  {/* Parent row */}
                  <button
                    onClick={() => toggle(acc.kontoPrefix)}
                    className="w-full grid grid-cols-[32px_1fr_auto] gap-2 px-5 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight
                      size={13}
                      className={`text-gray-400 mt-0.5 transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
                      strokeWidth={2}
                    />
                    <span className="text-sm font-mono font-medium text-gray-800">{acc.kontoPrefix}</span>
                    <span className="text-sm font-semibold text-gray-900 text-right">
                      {fmtPln(prefixTotal)}
                      {currencies !== 'PLN' && (
                        <span className="ml-1.5 text-[10px] font-normal text-gray-400">{currencies}</span>
                      )}
                    </span>
                  </button>

                  {/* Sub-account rows */}
                  {open && (
                    <div className="bg-gray-50 border-t border-gray-100">
                      {acc.subAccounts.map(sub => (
                        <div
                          key={sub.subKonto}
                          className="grid grid-cols-[32px_1fr_auto] gap-2 px-5 py-2 border-b border-gray-100 last:border-0"
                        >
                          <span />
                          <span className="text-xs font-mono text-gray-500 pl-4">{sub.subKonto}</span>
                          <span className="text-xs font-medium text-gray-700 text-right">
                            {fmt(sub.sumaWn, sub.waluta)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Total footer */}
            <div className="grid grid-cols-[32px_1fr_auto] gap-2 px-5 py-3 bg-gray-50 border-t border-gray-200">
              <span />
              <span className="text-xs font-semibold text-gray-700">Total</span>
              <span className="text-xs font-bold text-gray-900 text-right">{fmtPln(totalWn)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
