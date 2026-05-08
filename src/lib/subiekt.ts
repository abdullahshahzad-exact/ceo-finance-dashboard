/**
 * Subiekt GT ERP API client
 * Base URL: proxied through Vite at /subiekt → SUBIEKT_API_URL
 * Auth: x-api-key header injected by Vite proxy (never exposed to browser)
 *
 * Endpoints covered:
 *   GET  /products                        – paginated product list
 *   GET  /products/{symbol}               – single product by symbol
 *   GET  /products/{symbol}/purchase-prices
 *   GET  /products/{symbol}/sales-prices
 *   POST /products/add                    – add a new product
 *   GET  /sales-statistics                – sales stats for a specific product
 *   GET  /products/sales-statistics       – sales stats for all products (paginated)
 *   GET  /products/total-units-sold       – aggregate units sold
 *   GET  /products/total-net-sales        – aggregate net sales value
 *   GET  /products/total-gross-sales      – aggregate gross sales value (incl. VAT)
 *   GET  /products/average-profit-margin  – average profit margin %
 *   GET  /products/sales-summary          – all key metrics in one call
 *   GET  /products/sales-summary/marketplace – sales summary for a specific marketplace
 */

import { useState, useEffect } from 'react'

const isLocalHost = typeof window !== 'undefined'
  && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
const BASE = isLocalHost ? '/subiekt' : '/api/subiekt'

type Params = Record<string, string | number | boolean | undefined | null>

function preview(text: string, max = 180) {
  if (!text) return ''
  const oneLine = text.replace(/\s+/g, ' ').trim()
  return oneLine.length > max ? `${oneLine.slice(0, max)}...` : oneLine
}

async function parseJsonOrThrow<T>(res: Response, path: string): Promise<T> {
  const requestId = res.headers.get('x-proxy-request-id') || 'n/a'
  const contentType = res.headers.get('content-type') || ''
  const raw = await res.text()

  if (!res.ok) {
    throw new Error(`Subiekt API ${res.status}: ${path} [req:${requestId}] ${preview(raw)}`)
  }

  if (!contentType.includes('application/json')) {
    throw new Error(`Subiekt API non-JSON response: ${path} [req:${requestId}] ${preview(raw)}`)
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    throw new Error(`Subiekt API invalid JSON: ${path} [req:${requestId}] ${preview(raw)}`)
  }
}

async function get<T>(path: string, params?: Params): Promise<T> {
  const url = new URL(`${BASE}${path}`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
    })
  }
  const res = await fetch(url.toString())
  return parseJsonOrThrow<T>(res, path)
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseJsonOrThrow<T>(res, path)
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Product {
  symbol: string
  name: string
  netPrice: number
  tax: number
  uom: string
}

export interface ProductsPage {
  items: Product[]
  totalCount: number
  page: number
  pageSize: number
  totalPages?: number
}

export interface AddProductPayload {
  symbol: string
  name: string
  netPrice: number
  tax: number
  uom: string
}

export interface SalesSummary {
  totalQuantity: number
  totalNetSales: number
  totalGrossSales: number
  totalCost: number
  totalProfit: number
  averageProfitMarginPercent: number
}

export interface ProductSalesStats {
  productId: number
  productSymbol: string
  productName: string
  totalQuantity: number
  totalNetSales: number
  totalGrossSales: number
  totalCost: number
  totalProfit: number
  averageProfitMarginPercent: number
  documentCount: number
}

export interface ProductsSalesStatsPage {
  items: ProductSalesStats[]
  totalCount: number
  page: number
  pageSize: number
}

// ── Product endpoints ─────────────────────────────────────────────────────────

export const getProducts = (pageNumber = 1, pageSize = 10) =>
  get<ProductsPage>('/products', { pageNumber, pageSize })

export const getProduct = (symbol: string) =>
  get<Product>(`/products/${encodeURIComponent(symbol)}`)

export const getProductPurchasePrices = (symbol: string) =>
  get<any>(`/products/${encodeURIComponent(symbol)}/purchase-prices`)

export const getProductSalesPrices = (symbol: string) =>
  get<any>(`/products/${encodeURIComponent(symbol)}/sales-prices`)

export const addProduct = (payload: AddProductPayload) =>
  post<Product>('/products/add', payload)

// ── Sales statistics ──────────────────────────────────────────────────────────

/** Sales stats for a specific product (or all if ProductSymbol omitted) */
export const getSalesStatistics = (params?: {
  ProductSymbol?: string
  DateFrom?: string
  DateTo?: string
  DocumentType?: string
  IncludeDocumentDetails?: boolean
}) => get<any>('/sales-statistics', params)

/** Sales stats for all products with pagination + filtering */
export const getProductsSalesStatistics = (params?: {
  Page?: number
  PageSize?: number
  GroupId?: number
  DateFrom?: string
  DateTo?: string
  DocumentType?: string
  SortBy?: string
  SortOrder?: string
}) => get<ProductsSalesStatsPage>('/products/sales-statistics', params)

// ── Aggregate metrics ─────────────────────────────────────────────────────────

export const getTotalUnitsSold = (params?: {
  DateFrom?: string
  DateTo?: string
  DocumentType?: string
  GroupId?: number
}) => get<number>('/products/total-units-sold', params)

export const getTotalNetSales = (params?: {
  DateFrom?: string
  DateTo?: string
  ProductSymbol?: string
  DocumentType?: string
}) => get<number>('/products/total-net-sales', params)

export const getTotalGrossSales = (params?: {
  DateFrom?: string
  DateTo?: string
  ProductSymbol?: string
  DocumentType?: string
}) => get<number>('/products/total-gross-sales', params)

export const getAverageProfitMargin = (params?: {
  DateFrom?: string
  DateTo?: string
  ProductSymbol?: string
  DocumentType?: string
}) => get<number>('/products/average-profit-margin', params)

/**
 * All key metrics in one call:
 * totalQuantity, totalNetSales, totalGrossSales, totalCost, totalProfit, averageProfitMarginPercent
 * All params optional – omit for all products / all time.
 */
export const getSalesSummary = (params?: {
  ProductSymbol?: string
  DateFrom?: string
  DateTo?: string
  DocumentType?: string
}) => get<SalesSummary>('/products/sales-summary', params)

/** Sales summary for a specific marketplace (dok_KartaId) */
export const getMarketplaceSalesSummary = (params?: {
  MarketplaceId?: number
  DateFrom?: string
  DateTo?: string
  DocumentType?: string
}) => get<SalesSummary>('/products/sales-summary/marketplace', params)

// ── React hooks ───────────────────────────────────────────────────────────────

function useSubiekt<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetcher()
      .then(d => { if (!cancelled) { setData(d); setError(null); setLoading(false) } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false) } })
    return () => { cancelled = true }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error }
}

export const useProducts = (pageNumber = 1, pageSize = 10) =>
  useSubiekt(() => getProducts(pageNumber, pageSize), [pageNumber, pageSize])

export const useProduct = (symbol: string) =>
  useSubiekt(() => getProduct(symbol), [symbol])

export const useSalesSummary = (params?: Parameters<typeof getSalesSummary>[0]) =>
  useSubiekt(() => getSalesSummary(params), [JSON.stringify(params)])

export const useProductsSalesStatistics = (params?: Parameters<typeof getProductsSalesStatistics>[0]) =>
  useSubiekt(() => getProductsSalesStatistics(params), [JSON.stringify(params)])

export const useTotalUnitsSold = (params?: Parameters<typeof getTotalUnitsSold>[0]) =>
  useSubiekt(() => getTotalUnitsSold(params), [JSON.stringify(params)])

export const useTotalNetSales = (params?: Parameters<typeof getTotalNetSales>[0]) =>
  useSubiekt(() => getTotalNetSales(params), [JSON.stringify(params)])

export const useTotalGrossSales = (params?: Parameters<typeof getTotalGrossSales>[0]) =>
  useSubiekt(() => getTotalGrossSales(params), [JSON.stringify(params)])

export const useAverageProfitMargin = (params?: Parameters<typeof getAverageProfitMargin>[0]) =>
  useSubiekt(() => getAverageProfitMargin(params), [JSON.stringify(params)])

export const useMarketplaceSalesSummary = (params?: Parameters<typeof getMarketplaceSalesSummary>[0]) =>
  useSubiekt(() => getMarketplaceSalesSummary(params), [JSON.stringify(params)])

export const getAllMarketplacesSummary = (
  ids: number[],
  params?: { DateFrom?: string; DateTo?: string; DocumentType?: string }
) =>
  Promise.all(
    ids.map(id =>
      getMarketplaceSalesSummary({ MarketplaceId: id, ...params })
        .then(s => ({ id, data: s }))
        .catch(() => ({ id, data: null as SalesSummary | null }))
    )
  )

export function useAllMarketplacesSummary(
  ids: number[],
  params?: { DateFrom?: string; DateTo?: string; DocumentType?: string }
) {
  return useSubiekt(
    () => getAllMarketplacesSummary(ids, params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ids.join(','), JSON.stringify(params)]
  )
}
