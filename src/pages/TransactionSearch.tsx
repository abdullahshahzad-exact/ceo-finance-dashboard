import { useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTransactionSearch } from '../lib/finance'

const PAGE_SIZE = 50

const fmtPln  = (n: number) =>
  `PLN ${(n ?? 0).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtDate = (s: string) => s?.slice(0, 10) ?? '—'
const toISO   = (d: string, end = false) =>
  d ? `${d}T${end ? '23:59:59' : '00:00:00'}Z` : undefined

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500 font-medium">{label}</label>
      <input
        type="date" value={value}
        onChange={e => onChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#7C3AED]"
      />
    </div>
  )
}

export default function TransactionSearch() {
  const [description, setDescription] = useState('')
  const [committed,   setCommitted]   = useState('')
  const [amountType,  setAmountType]  = useState('both')
  const [page,        setPage]        = useState(1)

  // Operation date range
  const [opFrom, setOpFrom] = useState('')
  const [opTo,   setOpTo]   = useState('')
  // Created-on date range
  const [crFrom, setCrFrom] = useState('')
  const [crTo,   setCrTo]   = useState('')

  const isValid = committed.trim().length >= 2

  const { data, loading, error } = useTransactionSearch({
    description:                    isValid ? committed.trim() : undefined,
    amountType,
    pageNumber:                     page,
    pageSize:                       PAGE_SIZE,
    transactionOperationDateFrom:   toISO(opFrom),
    transactionOperationDateTo:     toISO(opTo, true),
    createdOnFrom:                  toISO(crFrom),
    createdOnTo:                    toISO(crTo, true),
  })

  function handleSearch() {
    if (description.trim().length < 2) return
    setCommitted(description.trim())
    setPage(1)
  }

  const items       = data?.transactions ?? []
  const totalAmount = data?.totalAmount  ?? 0
  // API returns pageSize items per page; if we got a full page there may be more
  const hasMore     = items.length === PAGE_SIZE
  const totalPages  = hasMore ? page + 1 : page

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Transaction Search</h1>
        <p className="text-xs text-gray-400 mt-0.5">Search transactions by description using LIKE matching</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 space-y-4">
        {/* Description row */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">
            Description <span className="text-gray-400">(min. 2 chars)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. DHL, Amazon, HUBSTAFF, ANTHROPIC, etc."
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#7C3AED] placeholder-gray-300"
            />
            <button
              onClick={handleSearch}
              disabled={description.trim().length < 2}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#7C3AED] text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Search size={14} strokeWidth={2} /> Search
            </button>
          </div>
        </div>

        {/* Amount type + date filters row */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Amount type</label>
            <select
              value={amountType}
              onChange={e => { setAmountType(e.target.value); setPage(1) }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#7C3AED] bg-white"
            >
              <option value="both">Both</option>
              <option value="income">Income</option>
              <option value="outcome">Outcome</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex items-end gap-2">
            <span className="text-xs text-gray-500 font-medium mb-2.5">Operation date:</span>
            <DateInput label="From" value={opFrom} onChange={v => { setOpFrom(v); setPage(1) }} />
            <DateInput label="To"   value={opTo}   onChange={v => { setOpTo(v);   setPage(1) }} />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-xs text-gray-500 font-medium mb-2.5">Created on:</span>
            <DateInput label="From" value={crFrom} onChange={v => { setCrFrom(v); setPage(1) }} />
            <DateInput label="To"   value={crTo}   onChange={v => { setCrTo(v);   setPage(1) }} />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search size={15} className="text-[#7C3AED]" strokeWidth={1.8} />
            <span className="font-semibold text-sm text-gray-900">Results</span>
            {isValid && !loading && data && (
              <span className="text-xs text-gray-400 ml-1">
                {items.length} results for &ldquo;{committed}&rdquo;
                {' · '}total: <span className={totalAmount >= 0 ? 'text-green-600' : 'text-red-500'}>{fmtPln(totalAmount)}</span>
              </span>
            )}
          </div>
          {isValid && !loading && totalPages > 1 && (
            <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
          )}
        </div>

        {!isValid && !loading && (
          <div className="py-16 text-center text-sm text-gray-400">Enter at least 2 characters and press Search.</div>
        )}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Searching…</p>
          </div>
        )}
        {!loading && error && (
          <div className="py-8 text-center text-sm text-red-500">{error}</div>
        )}
        {!loading && !error && isValid && items.length === 0 && (
          <div className="py-16 text-center text-sm text-gray-400">No transactions found for &ldquo;{committed}&rdquo;.</div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-gray-500 font-semibold uppercase tracking-wide">ID</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold uppercase tracking-wide">Op. Date</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold uppercase tracking-wide">Description</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-semibold uppercase tracking-wide">Account</th>
                  <th className="text-right px-5 py-3 text-gray-500 font-semibold uppercase tracking-wide">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map(tx => (
                  <tr key={tx.transactionId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-2.5 font-mono text-gray-500">{tx.transactionId}</td>
                    <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{fmtDate(tx.transactionOperationDate)}</td>
                    <td className="px-4 py-2.5 text-gray-800 max-w-[340px]">
                      <span className="line-clamp-2">{tx.transactionDescription}</span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{tx.account?.accountName ?? '—'}</td>
                    <td className="px-5 py-2.5 text-right font-semibold tabular-nums text-gray-900">{fmtPln(tx.transactionAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-purple-400 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={13} /> Previous
            </button>
            <span className="text-xs text-gray-500">
              Page <span className="font-semibold text-gray-800">{page}</span>
              {hasMore ? '+' : ''} — {items.length} records
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!hasMore}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-purple-400 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
