/**
 * CEO Dashboard API client
 * Connects to the FastAPI backend at /api/* (proxied by Vite)
 * Backend runs on port 8001, Vite proxies /api → http://localhost:8001
 */

const BASE = '/api'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

// ── Dashboard ─────────────────────────────────────────────────────

export interface DashboardSummary {
  date: string
  financials: {
    revenue_pln: number
    net_revenue_pln: number
    inventory_purchases_pln: number
    gross_margin_pct: number
    ar_outstanding_pln: number
    ap_outstanding_pln: number
    ar_overdue_pln?: number
    ap_due_14d_pln?: number
  }
  banking: {
    eur_balance: number
    pln_balance: number
    usd_balance: number
    gbp_balance: number
    accounts_count: number
  }
  marketplace: {
    orders_today: number
    revenue_today_eur: number
    by_channel: Record<string, { orders: number; revenue_eur: number }>
  }
  errors: Record<string, string>
}

export const getDashboardSummary = () => get<DashboardSummary>('/v1/dashboard/summary')

// ── Financials ────────────────────────────────────────────────────

export const getKpi = (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams()
  if (startDate) params.set('start_date', startDate)
  if (endDate) params.set('end_date', endDate)
  const qs = params.toString()
  return get<any>(`/v1/financials/kpi${qs ? '?' + qs : ''}`)
}
export const getPlMonthly = (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams()
  if (startDate) params.set('start_date', startDate)
  if (endDate) params.set('end_date', endDate)
  const qs = params.toString()
  return get<any>(`/v1/financials/pl-monthly${qs ? '?' + qs : ''}`)
}
export const getCashflow = () => get<any>('/v1/financials/cashflow')
export const getAR = () => get<any>('/v1/financials/ar')
export const getAP = () => get<any>('/v1/financials/ap')
export const getCommissions = () => get<any>('/v1/financials/commissions')

// ── Banking ───────────────────────────────────────────────────────

export const getBankAccounts = () => get<any>('/v1/banking/accounts')
export const getCashSummary = () => get<any>('/v1/banking/cash-summary')
export const getTransactions = (days = 30) => get<any>(`/v1/banking/transactions?days=${days}`)

// ── Marketplace ───────────────────────────────────────────────────

export const getOrdersToday = () => get<any>('/v1/marketplace/orders/today')
export const getMarketplaceBreakdown = (days = 30) => get<any>(`/v1/marketplace/breakdown?days=${days}`)

// ── Analytics ─────────────────────────────────────────────────────

export const getExpenses = () => get<any>('/v1/financials/expenses')
export const getAnalyticsTrends = () => get<any>('/v1/analytics/trends')
export const getHealth = () => get<any>('/health')

// ── Hook: useAPI ──────────────────────────────────────────────────
import { useState, useEffect } from 'react'

export function useAPI<T>(fetcher: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let retries = 0
    const maxRetries = 3
    
    const run = () => {
      setLoading(true)
      fetcher()
        .then(d => { if (!cancelled) { setData(d); setError(null); setLoading(false) } })
        .catch(e => {
          if (!cancelled) {
            if (retries < maxRetries) {
              retries++
              setTimeout(run, 2000 * retries) // exponential backoff
            } else {
              setError(e.message)
              setLoading(false)
            }
          }
        })
    }
    run()
    return () => { cancelled = true }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error }
}
