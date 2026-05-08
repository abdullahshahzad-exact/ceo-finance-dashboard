import { useState } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import {
  LayoutDashboard, TrendingUp, Landmark, Package, ShoppingCart,
  AlertTriangle, Receipt, Users, DollarSign, BarChart2,
  Home, ShoppingBag, HeadphonesIcon, UserCheck, ChevronRight,
  Bell, Settings, Sun, Languages, Search, Database, Cpu
} from 'lucide-react'

import Dashboard from './pages/Dashboard'
import Profitability from './pages/Profitability'
import CashRunway from './pages/CashRunway'
import ARAP from './pages/ARAP'
import Inventory from './pages/Inventory'
import Marketplace from './pages/Marketplace'
import Taxes from './pages/Taxes'
import Payroll from './pages/Payroll'
import MoneyStuck from './pages/MoneyStuck'
import RevenueUnits from './pages/RevenueUnits'
import Alerts from './pages/Alerts'
import AccountSums from './pages/AccountSums'
import Employees from './pages/Employees'
import TransactionSearch from './pages/TransactionSearch'

const nav = [
  { group: null, items: [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/orders', icon: ShoppingBag, label: 'Orders' },
    { to: '/support', icon: HeadphonesIcon, label: 'Support Agent' },
    { to: '/sales', icon: TrendingUp, label: 'Sales Agent' },
    { to: '/purchase', icon: ShoppingCart, label: 'Purchase Agent' },
  ]},
  { group: 'Financial Agent', items: [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/revenue', icon: BarChart2, label: 'Revenue & Units' },
    { to: '/profitability', icon: TrendingUp, label: 'Profitability' },
    { to: '/cash-runway', icon: Landmark, label: 'Cash Runway' },
    { to: '/ar-ap', icon: DollarSign, label: 'AR / AP' },
    { to: '/inventory', icon: Package, label: 'Inventory' },
    { to: '/marketplace', icon: ShoppingCart, label: 'Marketplaces & Logistics' },
    { to: '/taxes', icon: Receipt, label: 'Taxes (VAT/OSS/CIT)' },
    { to: '/payroll', icon: Users, label: 'Payroll' },
    { to: '/employees', icon: Users, label: 'Employees' },
    { to: '/account-sums', icon: Receipt, label: 'Account Sums' },
    { to: '/transactions', icon: Search, label: 'Transaction Search' },
    { to: '/money-stuck', icon: AlertTriangle, label: 'Money Stuck' },
    { to: '/alerts', icon: Bell, label: 'Alerts & Actions' },
  ]},
  { group: null, items: [
    { to: '/data-recon', icon: Database, label: 'Data Reconciliation' },
    { to: '/ops', icon: Cpu, label: 'Operational Agent' },
    { to: '/hr', icon: UserCheck, label: 'HR Agent' },
    { to: '/people', icon: Users, label: 'People Force' },
  ]},
]

function Sidebar() {
  const [finOpen, setFinOpen] = useState(true)
  return (
    <aside className="w-[200px] flex-shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-[18px] border-b border-gray-100">
        <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">EF</span>
        </div>
        <span className="font-semibold text-gray-900 text-sm">ExactFlow</span>
        <div className="ml-auto w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {/* Top items */}
        {(nav[0]?.items ?? []).map(({ to, icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer text-sm">
            <Icon size={15} strokeWidth={1.8} />
            <span className="flex-1 text-sm">{label}</span>
            <ChevronRight size={12} className="opacity-30" />
          </div>
        ))}

        {/* Financial Agent group */}
        <div className="mt-2">
          <button onClick={() => setFinOpen(v => !v)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-purple-50 text-sm font-medium text-gray-700 mb-1">
            <DollarSign size={15} strokeWidth={1.8} className="text-[#7C3AED]" />
            <span className="flex-1 text-left">Financial Agent</span>
            <ChevronRight size={12} className={`opacity-50 transition-transform duration-200 ${finOpen ? 'rotate-90' : ''}`} />
          </button>

          {finOpen && (nav[1]?.items ?? []).map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-[7px] rounded-lg text-xs mb-0.5 transition-colors ${
                  isActive
                    ? 'bg-[#7C3AED] text-white font-medium'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`
              }>
              {({ isActive }) => (
                <>
                  <Icon size={13} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Bottom items */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          {(nav[2]?.items ?? []).map(({ to, icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer">
              <Icon size={15} strokeWidth={1.8} />
              <span className="flex-1 text-sm">{label}</span>
              <ChevronRight size={12} className="opacity-30" />
            </div>
          ))}
        </div>
      </nav>
    </aside>
  )
}

function TopBar() {
  return (
    <header className="bg-white border-b border-gray-100 px-6 h-14 flex items-center gap-4 sticky top-0 z-10">
      <div className="flex items-center gap-2 flex-1 max-w-xs bg-gray-50 rounded-lg px-3 py-2">
        <Search size={14} className="text-gray-400" strokeWidth={2} />
        <input placeholder="Search K" className="text-xs text-gray-500 bg-transparent outline-none flex-1 w-full" />
      </div>
      <div className="ml-auto flex items-center gap-4">
        <Sun size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" strokeWidth={1.8} />
        <Languages size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" strokeWidth={1.8} />
        <Settings size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" strokeWidth={1.8} />
        <Bell size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" strokeWidth={1.8} />
        <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center cursor-pointer">
          <span className="text-white text-xs font-semibold">I</span>
        </div>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <div className="flex h-screen bg-[#EEF0F8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/revenue" element={<RevenueUnits />} />
            <Route path="/profitability" element={<Profitability />} />
            <Route path="/cash-runway" element={<CashRunway />} />
            <Route path="/ar-ap" element={<ARAP />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/taxes" element={<Taxes />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/account-sums" element={<AccountSums />} />
            <Route path="/transactions" element={<TransactionSearch />} />
            <Route path="/money-stuck" element={<MoneyStuck />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
