import { useAPI, getAR, getAP } from '../lib/api'

export default function ARAP() {
  const { data: ar, loading: arL, error } = useAPI(getAR)
  const { data: ap, loading: apL } = useAPI(getAP)
  if (arL || apL) return <div className="p-6 text-gray-500 ">Loading AR/AP data...</div>

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {error && <div className="bg-amber-900/30 border border-amber-600 rounded-lg p-3 text-amber-600 text-sm">⚠️ Backend offline</div>}
      <h1 className="text-2xl font-bold text-gray-900">Accounts Receivable / Payable</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 border shadow-sm border-gray-200">
          <h3 className="text-gray-900 font-semibold mb-4">Accounts Receivable</h3>
          <div className="space-y-3">
            {[
              { label: 'Outstanding', value: ar?.outstanding_total, color: 'text-red-400' },
              { label: 'Total Revenue', value: ar?.total_revenue, color: 'text-gray-900' },
              { label: 'Total Paid', value: ar?.total_paid, color: 'text-green-600' },
              { label: 'Overdue', value: ar?.ar_overdue, color: 'text-red-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-500 text-sm">{label}</span>
                <span className={`font-bold ${color}`}>PLN {(value ?? 0).toLocaleString('en', {maximumFractionDigits: 0})}</span>
              </div>
            ))}
          </div>
          {ar?.aging_buckets && ar.aging_buckets.length > 0 && (
            <div className="mt-4">
              <p className="text-gray-500 text-xs mb-2">Aging Buckets</p>
              {ar.aging_buckets.map((b: any) => (
                <div key={b.range ?? b.bucket} className="flex justify-between text-xs py-1">
                  <span className="text-gray-400">{b.range ?? b.bucket}</span>
                  <span className="text-gray-900">PLN {(b.amount ?? b.value ?? 0).toLocaleString('en', {maximumFractionDigits: 0})}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl p-5 border shadow-sm border-gray-200">
          <h3 className="text-gray-900 font-semibold mb-4">Accounts Payable</h3>
          <div className="space-y-3">
            {[
              { label: 'Outstanding', value: ap?.outstanding_total, color: 'text-orange-400' },
              { label: 'Total Amount', value: ap?.total_amount, color: 'text-gray-900' },
              { label: 'Total Paid', value: ap?.total_paid, color: 'text-green-600' },
              { label: 'Due in 14 days', value: ap?.ap_due_14d, color: 'text-yellow-400' },
              { label: 'Overdue', value: ap?.ap_overdue, color: 'text-red-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-500 text-sm">{label}</span>
                <span className={`font-bold ${color}`}>PLN {(value ?? 0).toLocaleString('en', {maximumFractionDigits: 0})}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
