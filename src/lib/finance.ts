/**
 * Finance API client
 * Base URL: proxied through Vite at /finance → FINANCE_API_URL
 * Auth: x-api-key header injected by Vite proxy
 *
 * Endpoints covered:
 *   GET  /api/Transaction/search  – paginated transaction search (description LIKE, date ranges)
 */

import { useState, useEffect } from 'react'

const BASE = '/finance'

type Params = Record<string, string | number | undefined | null>

async function get<T>(path: string, params?: Params): Promise<T> {
  const url = new URL(`${BASE}${path}`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
    })
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Finance API ${res.status}: ${path}`)
  return res.json()
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TransactionAccount {
  accountId: number
  accountName: string
  accountNumber?: string
  [key: string]: unknown
}

export interface Transaction {
  transactionId: number
  transactionDescription: string
  transactionOperationDate: string
  transactionBookingDate?: string
  transactionAmount: number
  transactionBalance?: number
  transactionType?: string
  transactionPartnerName?: string
  transactionPaymentDetails?: string
  transactionPartnerAccountNo?: string
  transactionRefNumber?: string
  transactionNote?: string
  createdOn?: string
  modifiedOn?: string
  account: TransactionAccount | null
  [key: string]: unknown
}

export interface TransactionSearchResponse {
  amountType: string
  totalAmount: number
  pageNumber: number
  pageSize: number
  transactions: Transaction[]
}

// ── API functions ─────────────────────────────────────────────────────────────

export const searchTransactions = ({
  pageNumber  = 1,
  pageSize    = 50,
  amountType  = 'both',
  ...rest
}: {
  description?: string
  amountType?: string
  pageNumber?: number
  pageSize?: number
  transactionOperationDateFrom?: string
  transactionOperationDateTo?: string
  createdOnFrom?: string
  createdOnTo?: string
} = {}) =>
  get<TransactionSearchResponse>('/api/Transaction/search', { pageNumber, pageSize, amountType, ...rest })

// ── React hook ────────────────────────────────────────────────────────────────

function useFinance<T>(fetcher: () => Promise<T>, deps: unknown[] = [], enabled = true) {
  const [data, setData]       = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) { setData(null); setLoading(false); setError(null); return }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetcher()
      .then(d  => { if (!cancelled) { setData(d); setError(null); setLoading(false) } })
      .catch(e => { if (!cancelled) { setError(e.message);        setLoading(false) } })
    return () => { cancelled = true }
  }, [enabled, ...deps]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error }
}

export const useTransactionSearch = (params: Parameters<typeof searchTransactions>[0]) =>
  useFinance(
    () => searchTransactions(params),
    [JSON.stringify(params)],
    !!(params?.description && params.description.trim().length >= 2),
  )
