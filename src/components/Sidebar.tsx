import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, DollarSign, Banknote, Receipt, Package, Store, FileText, Users, AlertTriangle, Zap } from 'lucide-react'
import clsx from 'clsx'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'CEO Dashboard', exact: true },
  { to: '/revenue', icon: TrendingUp, label: 'Revenue & Units' },
  { to: '/profitability', icon: DollarSign, label: 'Profitability' },
  { to: '/cash-runway', icon: Banknote, label: 'Cash Runway' },
  { to: '/ar-ap', icon: Receipt, label: 'AR / AP' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/marketplaces', icon: Store, label: 'Marketplaces' },
  { to: '/taxes', icon: FileText, label: 'VAT / OSS / CIT' },
  { to: '/payroll', icon: Users, label: 'Payroll Poland' },
  { to: '/money-stuck', icon: Zap, label: 'Money Stuck', badge: '€91K' },
  { to: '/alerts', icon: AlertTriangle, label: 'Alerts', badge: '7' },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-dash-sidebar border-r border-dash-border flex flex-col z-50">
      <div className="p-4 border-b border-dash-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold">ES</div>
          <div>
            <p className="text-xs font-bold text-white leading-none">Exact Solution</p>
            <p className="text-[10px] text-slate-500 mt-0.5">CEO Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label, exact, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-sm transition-all duration-150',
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-dash-card'
              )
            }
          >
            <Icon size={15} />
            <span className="flex-1">{label}</span>
            {badge && (
              <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-medium">{badge}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-dash-border">
        <p className="text-[10px] text-slate-600 text-center">Last sync: just now</p>
      </div>
    </aside>
  )
}
