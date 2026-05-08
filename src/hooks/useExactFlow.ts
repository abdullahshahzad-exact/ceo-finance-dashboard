/**
 * ExactFlow / Subiekt data hooks.
 * Re-exports from the Subiekt service layer so components import from one place.
 */
export {
  useProducts,
  useProduct,
  useSalesSummary,
  useProductsSalesStatistics,
  useTotalUnitsSold,
  useTotalNetSales,
  useTotalGrossSales,
  useAverageProfitMargin,
} from '../lib/subiekt'

import { useState, useEffect } from 'react'

/** Legacy orders hook — still proxied through the FastAPI backend if running */
export function useOrders() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/v1/marketplace/orders/today')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  return { data, loading, error }
}
