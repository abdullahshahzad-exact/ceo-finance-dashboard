/**
 * Gratyfikant HR/Payroll API client
 * Base URL: proxied through Vite at /gratyfikant → GRATYFIKANT_API_URL
 * Auth: x-api-key header injected by Vite proxy (never exposed to browser)
 */

import { useState, useEffect } from 'react'

const isLocalHost = typeof window !== 'undefined'
  && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
const BASE = isLocalHost ? '/gratyfikant' : '/api/gratyfikant'

type Params = Record<string, string | number | undefined | null>

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
    throw new Error(`Gratyfikant API ${res.status}: ${path} [req:${requestId}] ${preview(raw)}`)
  }

  if (!contentType.includes('application/json')) {
    throw new Error(`Gratyfikant API non-JSON response: ${path} [req:${requestId}] ${preview(raw)}`)
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    throw new Error(`Gratyfikant API invalid JSON: ${path} [req:${requestId}] ${preview(raw)}`)
  }
}

async function get<T>(path: string, params?: Params): Promise<T> {
  const url = new URL(`${BASE}${path}`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
    })
  }
  const res = await fetch(url.toString(), { headers: { accept: 'application/json' } })
  return parseJsonOrThrow<T>(res, path)
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Page<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface Employee {
  pr_Id: number
  pr_Imie: string
  pr_Imie2: string
  pr_Nazwisko: string
  pr_DataObowiazywania: string
  pr_Plec: number
  pr_Narodowosc: string | null
  pr_Aktywny: boolean | null
  pr_DniDodatkowyUrlop: number
  pr_ZwolnienieZPodatku: boolean
  contracts?: UmowaCP[]
}

export interface UmowaCP {
  ucp_Id: number
  ucp_IdPracownika: number
  ucp_Numer: string
  ucp_RodzajUmowy: number
  ucp_NaCzas: number
  ucp_DataOd: string
  ucp_DataDo: string | null
  ucp_Rozwiazana: boolean
  ucp_DataRozwiazania: string | null
  ucp_Tytul: string
  ucp_Kwota: number
  ucp_PrzelewNaKonto: boolean
  ucp_DataZawarcia: string | null
}

export interface Wyplata {
  wypId: number
  wypIdListyPlac: number
  wypIdUmowy: number
  wypIdZestawu: number
  wypStatus: number
  wypOpis: string
  wypBruttoDuze: number
  wypBruttoMale: number
  wypKosztUzyskMc: number
  wypKosztUzysk50: number
  wypKosztUzysk: number
}

export interface Rachunek {
  ruId: number
  ruIdUmowy: number
  ruNumer: string
  ruDataWystawienia: string
  ruKwotaRachunku: number
  ruBruttoDuze: number
  ruNetto: number
  ruPrzelew: number
  ruPracownikOtrzymuje: number
  ruZUS: number
  ruPodatek: number
  ruUbezpZdrowotne: number
  ruZaliczkaNaPodatek: number
}

// ── API functions ─────────────────────────────────────────────────────────────

export const getEmployees = (pageNumer = 1, pageSize = 25) =>
  get<Page<Employee>>('/api/Employees', { pageNumer, pageSize })

export const getUmowyCP = (pageNumer = 1, pageSize = 25) =>
  get<Page<UmowaCP>>('/api/UmowyCP', { pageNumer, pageSize })

export const getUmowyCPByEmployee = (id: number, pageNumer = 1, pageSize = 25) =>
  get<Page<UmowaCP>>(`/api/UmowyCP/pracownik/${id}`, { pageNumer, pageSize })

export const getUmowyCPByNumber = (ucpNumber: string) =>
  get<UmowaCP>('/api/UmowyCP/UCPNumber', { ucpNumber })

export const getWyplaty = (pageNumer = 1, pageSize = 25) =>
  get<Page<Wyplata>>('/api/Wyplaty', { pageNumer, pageSize })

export const getWyplata = (wyplataId: number) =>
  get<Wyplata>(`/api/Wyplaty/${wyplataId}`)

export const getWyplatyByEmployee = (id: number, pageNumer = 1, pageSize = 25) =>
  get<Page<Wyplata>>(`/api/Wyplaty/pracownik/${id}`, { pageNumer, pageSize })

export const getWyplatyByUmowa = (umowaId: number, pageNumer = 1, pageSize = 25) =>
  get<Page<Wyplata>>(`/api/Wyplaty/umowa/${umowaId}`, { pageNumer, pageSize })

export const getRachunki = (pageNumer = 1, pageSize = 25) =>
  get<Page<Rachunek>>('/api/Rachunki', { pageNumer, pageSize })

export const getRachunkiByUmowa = (umowaId: number, pageNumer = 1, pageSize = 25) =>
  get<Page<Rachunek>>(`/api/Rachunki/${umowaId}`, { pageNumer, pageSize })

export const getRachunekByNumber = (number: string) =>
  get<Rachunek>('/api/Rachunki/rachunek', { number })

// ── React hooks ───────────────────────────────────────────────────────────────

function useGratyfikant<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
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

export const useEmployees = (pageNumer = 1, pageSize = 25) =>
  useGratyfikant(() => getEmployees(pageNumer, pageSize), [pageNumer, pageSize])

export const useUmowyCP = (pageNumer = 1, pageSize = 25) =>
  useGratyfikant(() => getUmowyCP(pageNumer, pageSize), [pageNumer, pageSize])

export const useWyplaty = (pageNumer = 1, pageSize = 25) =>
  useGratyfikant(() => getWyplaty(pageNumer, pageSize), [pageNumer, pageSize])

export const useRachunki = (pageNumer = 1, pageSize = 25) =>
  useGratyfikant(() => getRachunki(pageNumer, pageSize), [pageNumer, pageSize])

// ── SalaryTotals ─────────────────────────────────────────────────────────────

export interface SalaryTotals {
  from: string
  to: string
  umowaOPraceTotal: number
  umowaCPTotal: number
  grandTotal: number
  umowaOPraceGrossTotal: number
  umowaCPGrossTotal: number
  grandGrossTotal: number
}

export const getSalaryTotals = (from: string, to: string) =>
  get<SalaryTotals>('/api/SalaryTotals', { from, to })

export const useSalaryTotals = (from: string, to: string) =>
  useGratyfikant(() => getSalaryTotals(from, to), [from, to])

// ── UmowyOPrace (Employment Contracts) ───────────────────────────────────────

export interface UmowaOPrace {
  uop_Id: number
  uop_IdPracownika: number
  uop_Numer: string | null
  uop_DataOd: string
  uop_DataDo: string | null
  uop_RodzajUmowy: number | null
  uop_Stanowisko: string | null
  uop_WymiarEtatu: number | null
  uop_Wynagrodzenie: number | null
  uop_Rozwiazana: boolean | null
}

export const getUmowyOPraceByEmployee = (id: number, pageNumer = 1, pageSize = 25) =>
  get<Page<UmowaOPrace>>(`/api/UmowyOPrace/prawownik/${id}`, { pageNumer, pageSize })

export const getUmowyOPraceByEmail = (email: string, pageNumer = 1, pageSize = 25) =>
  get<Page<UmowaOPrace>>(`/api/UmowyOPrace/email/${encodeURIComponent(email)}`, { pageNumer, pageSize })

// ── Filter type aliases ───────────────────────────────────────────────────────

export type WyplatyFilter   = { type: 'employee' | 'contract' | 'id'; value: string }
export type UmowyCPFilter   = { type: 'employee' | 'number'; value: string }
export type RachunkiFilter  = { type: 'contract' | 'number'; value: string }
export type OPraceFilter    = { type: 'employee' | 'email'; value: string }

// ── Helper ────────────────────────────────────────────────────────────────────

function toPage<T>(items: T[]): Page<T> {
  return { items, totalCount: items.length, pageNumber: 1, pageSize: items.length, totalPages: 1 }
}

// ── Filter-aware hooks ────────────────────────────────────────────────────────

export function useWyplatyFiltered(filter: WyplatyFilter | null, page = 1, pageSize = 25) {
  return useGratyfikant((): Promise<Page<Wyplata>> => {
    if (!filter?.value) return getWyplaty(page, pageSize)
    const num = Number(filter.value)
    if (filter.type === 'employee') return getWyplatyByEmployee(num, page, pageSize)
    if (filter.type === 'contract') return getWyplatyByUmowa(num, page, pageSize)
    if (filter.type === 'id')       return getWyplata(num).then(w => toPage([w]))
    return getWyplaty(page, pageSize)
  }, [filter?.type, filter?.value, page, pageSize])
}

export function useUmowyCPFiltered(filter: UmowyCPFilter | null, page = 1, pageSize = 25) {
  return useGratyfikant((): Promise<Page<UmowaCP>> => {
    if (!filter?.value) return getUmowyCP(page, pageSize)
    if (filter.type === 'employee') return getUmowyCPByEmployee(Number(filter.value), page, pageSize)
    if (filter.type === 'number')   return getUmowyCPByNumber(filter.value).then(c => toPage([c]))
    return getUmowyCP(page, pageSize)
  }, [filter?.type, filter?.value, page, pageSize])
}

export function useRachunkiFiltered(filter: RachunkiFilter | null, page = 1, pageSize = 25) {
  return useGratyfikant((): Promise<Page<Rachunek>> => {
    if (!filter?.value) return getRachunki(page, pageSize)
    if (filter.type === 'contract') return getRachunkiByUmowa(Number(filter.value), page, pageSize)
    if (filter.type === 'number')   return getRachunekByNumber(filter.value).then(r => toPage([r]))
    return getRachunki(page, pageSize)
  }, [filter?.type, filter?.value, page, pageSize])
}

export function useUmowyOPrace(filter: OPraceFilter | null, page = 1, pageSize = 25) {
  return useGratyfikant((): Promise<Page<UmowaOPrace>> => {
    if (!filter?.value) return Promise.resolve(toPage<UmowaOPrace>([]))
    if (filter.type === 'employee') return getUmowyOPraceByEmployee(Number(filter.value), page, pageSize)
    if (filter.type === 'email')    return getUmowyOPraceByEmail(filter.value, page, pageSize)
    return Promise.resolve(toPage<UmowaOPrace>([]))
  }, [filter?.type, filter?.value, page, pageSize])
}
