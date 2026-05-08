/**
 * Rewizor accounting API client
 * Base URL: proxied through Vite at /rewizor → REWIZOR_API_URL
 * Auth: x-api-key header injected by Vite proxy (never exposed to browser)
 */

import { useState, useEffect } from 'react'

const BASE = '/rewizor'

type Params = Record<string, string | number | undefined | null>

async function get<T>(path: string, params?: Params): Promise<T> {
  const url = new URL(`${BASE}${path}`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
    })
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Rewizor API ${res.status}: ${path}`)
  return res.json()
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ExpenseDocument {
  documentId: number
  documentNumber: string
  documentDate: string
  registerType: string
  classification: string
  expenseAmount: number
  positionsCount: number
}

export interface ExpensesResponse {
  dateFrom: string | null
  dateTo: string | null
  registerType: string | null
  totalExpenseAmount: number
  documentsCount: number
  positionsCount: number
  documents: ExpenseDocument[]
}

// ── API functions ─────────────────────────────────────────────────────────────

export const getExpenses = (params?: {
  dateFrom?: string
  dateTo?: string
  registerType?: string
}) => get<ExpensesResponse>('/documents/expenses', params)

// ── AccountSums (account base number sums) ────────────────────────────────────

export interface SubAccount {
  subKonto: string
  waluta: string
  sumaWn: number
}

export interface AccountBaseSum {
  kontoPrefix: string
  subAccounts: SubAccount[]
}

export const getAccountSums = (params?: {
  dateFrom?: string
  dateTo?: string
  accountNumber?: string
}) => get<AccountBaseSum[]>('/documents/expenses/account-sums', params)

// ── React hook ────────────────────────────────────────────────────────────────

function useRewizor<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData]       = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetcher()
      .then(d  => { if (!cancelled) { setData(d); setError(null); setLoading(false) } })
      .catch(e => { if (!cancelled) { setError(e.message);        setLoading(false) } })
    return () => { cancelled = true }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error }
}

export const useExpenses = (params?: Parameters<typeof getExpenses>[0]) =>
  useRewizor(() => getExpenses(params), [JSON.stringify(params)])

export const useAccountSums = (params?: Parameters<typeof getAccountSums>[0]) =>
  useRewizor(() => getAccountSums(params), [JSON.stringify(params)])

