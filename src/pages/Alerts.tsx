import { useAPI, getAR, getAP, getOrdersToday, getBankAccounts } from '../lib/api'

export default function Alerts() {
  const { data: ar, loading, error } = useAPI(getAR)
  const { data: ap } = useAPI(getAP)
  const { data: orders } = useAPI(getOrdersToday)
  const { data: accounts } = useAPI(getBankAccounts)
  if (loading) return <div className="p-6 text-gray-500 animate-pulse">Loading alerts...</div>

  const alerts: { severity: string; title: string; detail: string }[] = []

  if (error) alerts.push({ severity: 'error', title: 'Backend offline', detail: 'Start uvicorn on port 8001 to see live alerts' })
  if ((ar?.ar_overdue ?? 0) > 0) alerts.push({ severity: 'red', title: `Overdue AR: PLN ${(ar!.ar_overdue).toLocaleString('en',{maximumFractionDigits:0})}`, detail: 'Customers have overdue payments. Review AR aging.' })
  if ((ap?.ap_due_14d ?? 0) > 0) alerts.push({ severity: 'amber', title: `AP Due in 14 days: PLN ${(ap!.ap_due_14d).toLocaleString('en',{maximumFractionDigits:0})}`, detail: 'Supplier invoices due soon. Ensure cash available.' })
  if ((orders?.total_orders ?? 0) < 10) alerts.push({ severity: 'amber', title: `Low orders today: ${orders?.total_orders ?? 0}`, detail: 'Orders below 10 today. Check marketplace listings.' })

  const allAccounts = Object.values(accounts?.by_currency ?? {}).flat() as any[]
  const overdrafts = allAccounts.filter((a: any) => a.balance < -500000)
  if (overdrafts.length > 0) alerts.push({ severity: 'red', title: `${overdrafts.length} accounts in deep overdraft`, detail: overdrafts.map((a: any) => `${a.name}: ${a.currency} ${a.balance.toLocaleString('en',{maximumFractionDigits:0})}`).join(' | ') })

  if (alerts.length === 0) alerts.push({ severity: 'green', title: '✅ All systems normal', detail: 'No alerts detected from live data.' })

  const colors: any = { red: 'border-red-700 bg-red-950/30 text-red-400', amber: 'border-amber-700 bg-amber-950/30 text-amber-400', green: 'border-green-700 bg-green-950/30 text-green-400', error: 'border-gray-700 bg-gray-950/30 text-gray-400' }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-white">Alerts & Actions</h1>
      <p className="text-gray-500 text-sm">Live alerts based on real API data — {new Date().toLocaleDateString()}</p>
      {alerts.map((a, i) => (
        <div key={i} className={`rounded-xl p-5 border shadow-sm ${colors[a.severity]}`}>
          <div className="font-semibold">{a.title}</div>
          <div className="text-sm mt-1 opacity-80">{a.detail}</div>
        </div>
      ))}
    </div>
  )
}
