import { useState } from 'react'
import { useEmployees } from '../lib/gratyfikant'
import type { Employee } from '../lib/gratyfikant'
import { Users, ChevronLeft, ChevronRight } from 'lucide-react'

const fmtDate = (s: string | null) => s ? s.slice(0, 10) : '—'

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Loading…</p>
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

function EmployeesTable({ items, loading }: { items: Employee[]; loading: boolean }) {
  if (loading) return <Spinner />
  if (!items.length) return <div className="text-center text-gray-400 text-sm py-10">No data</div>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-gray-100">
          <Th>ID</Th><Th>First Name</Th><Th>Last Name</Th><Th>Start Date</Th>
        </tr></thead>
        <tbody className="divide-y divide-gray-50">
          {items.map(e => (
            <tr key={e.pr_Id} className="hover:bg-gray-50/60 transition-colors">
              <Td mono>{e.pr_Id}</Td>
              <Td>{e.pr_Imie}</Td>
              <Td><span className="font-medium text-gray-900">{e.pr_Nazwisko}</span></Td>
              <Td>{fmtDate(e.pr_DataObowiazywania)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Employees() {
  const [page, setPage] = useState(1)
  const { data, loading, error } = useEmployees(page)
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-purple-50 rounded-full flex items-center justify-center">
          <Users size={17} className="text-purple-600" strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Employees</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {data ? `${data.totalCount.toLocaleString()} employees in Gratyfikant` : 'Data from Gratyfikant HR system'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
          ⚠️ Gratyfikant API error: {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">
            Employees {data ? `(${data.totalCount.toLocaleString()})` : ''}
          </h3>
          <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
        </div>

        <EmployeesTable items={data?.items ?? []} loading={loading} />

        {totalPages > 1 && (
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
        )}
      </div>
    </div>
  )
}
