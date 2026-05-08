import { useState } from 'react'
import { useSalaryTotals } from '../lib/gratyfikant'
import { useExpenses } from '../lib/rewizor'
import { Users, Wallet, ChevronLeft, ChevronRight } from 'lucide-react'

const fmtPln  = (n: number) => `PLN ${(n ?? 0).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtNum  = (n: number) => Math.round(n).toLocaleString('pl-PL')
const fmtDate = (s: string | null) => s ? s.slice(0, 10) : '—'

const today    = new Date().toISOString().slice(0, 10)
const thisYear = new Date().getFullYear()

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Loading…</p>
    </div>
  )
}

function KpiTile({ label, value, sub, icon: Icon, iconBg, iconColor }: any) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex items-start gap-4">
      <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon size={17} className={iconColor} strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function Pagination({ page, totalPages, setPage }: {
  page: number; totalPages: number; setPage: (fn: (p: number) => number) => void
}) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-purple-400 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <ChevronLeft size={13} /> Previous
      </button>
      <span className="text-xs text-gray-400">
        Page <span className="font-semibold text-gray-700">{page}</span> of <span className="font-semibold text-gray-700">{totalPages}</span>
      </span>
      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-purple-400 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        Next <ChevronRight size={13} />
      </button>
    </div>
  )
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap bg-gray-50 ${right ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  )
}
function Td({ children, right, mono }: { children: React.ReactNode; right?: boolean; mono?: boolean }) {
  return (
    <td className={`py-2.5 px-4 text-xs text-gray-700 ${right ? 'text-right tabular-nums' : ''} ${mono ? 'font-mono' : ''}`}>
      {children}
    </td>
  )
}


export default function Payroll() {
  const [salFrom, setSalFrom] = useState('2012-01-01')
  const [salTo,   setSalTo]   = useState(today)
  const { data: salData, loading: salLoading, error: salError } = useSalaryTotals(salFrom, salTo)

  const [expFrom,         setExpFrom]         = useState(`${thisYear}-01-01`)
  const [expTo,           setExpTo]           = useState(today)
  const [expRegisterType, setExpRegisterType] = useState('')
  const { data: expData, loading: expLoading, error: expError } = useExpenses({
    dateFrom:     expFrom       || undefined,
    dateTo:       expTo         || undefined,
    registerType: expRegisterType || undefined,
  })

  const anyError = salError || expError

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Payroll & HR</h1>
        <p className="text-xs text-gray-400 mt-0.5">Data from Gratyfikant HR system</p>
      </div>

      {anyError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
          ⚠️ Gratyfikant API error: {anyError}
        </div>
      )}

      {/* KPI tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiTile
          label="Employment Contracts Net"
          value={salLoading ? '…' : salData ? fmtPln(salData.umowaOPraceTotal) : '—'}
          sub={salData ? `Gross: ${fmtPln(salData.umowaOPraceGrossTotal)}` : `${salFrom} → ${salTo}`}
          icon={Wallet}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
        />
        <KpiTile
          label="Civil-Law Contracts Net"
          value={salLoading ? '…' : salData ? fmtPln(salData.umowaCPTotal) : '—'}
          sub={salData ? `Gross: ${fmtPln(salData.umowaCPGrossTotal)}` : `${salFrom} → ${salTo}`}
          icon={Wallet}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
      </div>

      {/* Salary Totals card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Salary Totals</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">Period:</span>
            <input type="date" value={salFrom} onChange={e => setSalFrom(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400" />
            <span className="text-xs text-gray-400">→</span>
            <input type="date" value={salTo} onChange={e => setSalTo(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400" />
            {[
              [`${thisYear} YTD`, `${thisYear}-01-01`, today],
              ['2025 Full',       '2025-01-01',        '2025-12-31'],
              ['All time',        '2012-01-01',        today],
            ].map(([l, f, t]) => (
              <button key={l} onClick={() => { setSalFrom(f as string); setSalTo(t as string) }}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors">{l}</button>
            ))}
          </div>
        </div>

        {salLoading ? <Spinner /> : salData ? (
          <div className="px-5 py-4 space-y-2">
            <div className="flex justify-end gap-4 px-4 pb-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-40 text-right">Net</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-40 text-right">Gross</span>
            </div>
            {[
              { label: 'Employment Contracts (UmowaOPrace)', net: salData.umowaOPraceTotal, gross: salData.umowaOPraceGrossTotal },
              { label: 'Civil-Law Contracts (UmowaCP)',      net: salData.umowaCPTotal,      gross: salData.umowaCPGrossTotal      },
            ].map(({ label, net, gross }) => (
              <div key={label} className="flex justify-between items-center py-2.5 px-4 rounded-lg bg-gray-50">
                <span className="text-sm text-gray-600">{label}</span>
                <div className="flex gap-4">
                  <span className="text-sm font-semibold tabular-nums w-40 text-right text-gray-900">{fmtPln(net)}</span>
                  <span className="text-sm tabular-nums w-40 text-right text-gray-400">{fmtPln(gross)}</span>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center py-2.5 px-4 rounded-lg bg-purple-50 border border-purple-100">
              <span className="text-sm font-bold text-gray-900">Grand Total</span>
              <div className="flex gap-4">
                <span className="text-sm font-bold tabular-nums w-40 text-right text-gray-900">{fmtPln(salData.grandTotal)}</span>
                <span className="text-sm font-semibold tabular-nums w-40 text-right text-gray-400">{fmtPln(salData.grandGrossTotal)}</span>
              </div>
            </div>
            {salData.grandTotal > 0 && (
              <div className="pt-2">
                <div className="flex rounded-full overflow-hidden h-1.5">
                  <div className="bg-blue-500 h-1.5" style={{ width: `${salData.umowaOPraceTotal / salData.grandTotal * 100}%` }} />
                  <div className="bg-green-500 h-1.5 flex-1" />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>UmowaOPrace {(salData.umowaOPraceTotal / salData.grandTotal * 100).toFixed(1)}%</span>
                  <span>UmowaCP {(salData.umowaCPTotal / salData.grandTotal * 100).toFixed(1)}%</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400 text-sm py-10">No data</div>
        )}
      </div>

      {/* Expenses card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Expenses</h3>
            <p className="text-xs text-gray-400 mt-0.5">GET /documents/expenses — classified by register type</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">Period:</span>
            <input type="date" value={expFrom} onChange={e => setExpFrom(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400" />
            <span className="text-xs text-gray-400">→</span>
            <input type="date" value={expTo} onChange={e => setExpTo(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-400" />
            <input
              type="text"
              value={expRegisterType}
              onChange={e => setExpRegisterType(e.target.value)}
              placeholder="Register type…"
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 w-32 focus:outline-none focus:ring-1 focus:ring-purple-400 placeholder-gray-400"
            />
            {[
              [`${thisYear} YTD`, `${thisYear}-01-01`, today],
              ['2025 Full',       '2025-01-01',        '2025-12-31'],
            ].map(([l, f, t]) => (
              <button key={l} onClick={() => { setExpFrom(f as string); setExpTo(t as string) }}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors">{l}</button>
            ))}
          </div>
        </div>

        {/* Summary row */}
        {!expLoading && expData && (
          <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-gray-400">Total Expenses</p>
              <p className="text-base font-bold text-gray-900 tabular-nums">{fmtPln(expData.totalExpenseAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Documents</p>
              <p className="text-base font-bold text-gray-900 tabular-nums">{expData.documentsCount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Positions</p>
              <p className="text-base font-bold text-gray-900 tabular-nums">{expData.positionsCount}</p>
            </div>
          </div>
        )}

        {expLoading ? <Spinner /> : !expData?.documents?.length ? (
          <div className="text-center text-gray-400 text-sm py-10">No expense documents for this period</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                <Th>Doc Number</Th>
                <Th>Date</Th>
                <Th>Register Type</Th>
                <Th right>Positions</Th>
                <Th right>Amount</Th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {expData.documents.map(d => (
                  <tr key={d.documentId} className="hover:bg-gray-50/60 transition-colors">
                    <Td mono>{d.documentNumber || '—'}</Td>
                    <Td>{d.documentDate ? d.documentDate.slice(0, 10) : '—'}</Td>
                    <Td>
                      {d.registerType ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {d.registerType}
                        </span>
                      ) : '—'}
                    </Td>
                    <Td right>{d.positionsCount}</Td>
                    <Td right><span className="font-semibold text-gray-900">{fmtPln(d.expenseAmount)}</span></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
