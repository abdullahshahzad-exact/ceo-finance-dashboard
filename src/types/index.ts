export interface OrdersData {
  total_item: number
  pendingCount: number
  completedCount: number
}

export interface MetricTile {
  label: string
  value: number
  change: number
  changeLabel?: string
  prefix?: string
  suffix?: string
  format?: 'currency' | 'number' | 'percent'
  severity?: 'normal' | 'warning' | 'danger' | 'success'
}

export interface Alert {
  id: string
  severity: 'RED' | 'AMBER' | 'GREEN'
  issueType: string
  counterparty: string
  amount: number
  agingDays: number
  owner: string
  nextAction: string
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  grossMargin: number
  netMargin: number
}

export interface ChannelMargin {
  channel: string
  revenue: number
  margin: number
  marginPct: number
  units: number
}

export interface CashForecast {
  week: string
  balance?: number
  forecast?: number
}

export interface InventoryAging {
  range: string
  value: number
  units: number
}

export interface MarketplaceHold {
  marketplace: string
  amount: number
  agingDays: number
  status: string
}

export interface ARItem {
  customer: string
  invoiceNo: string
  amount: number
  dueDate: string
  agingDays: number
  status: 'current' | 'overdue' | 'critical'
}

export interface APItem {
  supplier: string
  invoiceNo: string
  amount: number
  dueDate: string
  agingDays: number
}

export interface TaxItem {
  type: string
  period: string
  amount: number
  dueDate: string
  status: 'paid' | 'pending' | 'overdue'
}

export interface PayrollItem {
  employee: string
  role: string
  grossSalary: number
  zusCost: number
  netPay: number
  month: string
}
