import type { VercelRequest, VercelResponse } from '@vercel/node'

const SERVICE_CONFIG: Record<string, { urlEnv: string; keyEnv: string; defaultUrl: string }> = {
  subiekt:     { urlEnv: 'SUBIEKT_API_URL',     keyEnv: 'SUBIEKT_API_KEY',     defaultUrl: 'https://subiekt-api.ngrok.app' },
  gratyfikant: { urlEnv: 'GRATYFIKANT_API_URL', keyEnv: 'GRATYFIKANT_API_KEY', defaultUrl: 'https://gratyfikant-api.ngrok.app' },
  rewizor:     { urlEnv: 'REWIZOR_API_URL',     keyEnv: 'REWIZOR_API_KEY',     defaultUrl: 'https://rewizor-api.ngrok.dev' },
  finance:     { urlEnv: 'FINANCE_API_URL',     keyEnv: 'FINANCE_API_KEY',     defaultUrl: 'https://financial.exactflow.ngrok.dev' },
}

function log(level: 'info' | 'warn' | 'error', requestId: string, message: string, meta?: Record<string, unknown>) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    requestId,
    message,
    ...(meta ?? {}),
  }
  if (level === 'error') {
    console.error(JSON.stringify(payload))
    return
  }
  if (level === 'warn') {
    console.warn(JSON.stringify(payload))
    return
  }
  console.log(JSON.stringify(payload))
}

function safeBodyPreview(body: string, max = 1000) {
  if (!body) return ''
  return body.length > max ? `${body.slice(0, max)}...[truncated]` : body
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const start = Date.now()
  const requestId = `px-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  res.setHeader('x-proxy-request-id', requestId)

  const service = req.query.service as string
  const pathParts = req.query.path as string[] | undefined

  const config = SERVICE_CONFIG[service]
  if (!config) {
    log('warn', requestId, 'Unknown service requested', {
      service,
      method: req.method,
      url: req.url,
    })
    res.status(404).json({ error: `Unknown service: ${service}` })
    return
  }

  const baseUrl = process.env[config.urlEnv] || config.defaultUrl
  const apiKey  = process.env[config.keyEnv]  || ''
  const path    = pathParts ? '/' + pathParts.join('/') : '/'

  // Forward query params (excluding Vercel's internal routing params)
  const searchParams = new URLSearchParams()
  for (const [k, v] of Object.entries(req.query)) {
    if (k !== 'service' && k !== 'path') {
      searchParams.set(k, String(v))
    }
  }

  const qs = searchParams.toString()
  const targetUrl = `${baseUrl}${path}${qs ? '?' + qs : ''}`

  log('info', requestId, 'Proxy request started', {
    service,
    method: req.method,
    incomingUrl: req.url,
    targetUrl,
    hasApiKey: Boolean(apiKey),
  })

  try {
    const apiRes = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'x-api-key': apiKey,
        'accept': 'application/json',
        // Prevent ngrok interstitial HTML pages from being returned to API clients.
        'ngrok-skip-browser-warning': 'true',
        ...(req.body && req.method !== 'GET' ? { 'content-type': 'application/json' } : {}),
      },
      body: req.body && req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    })

    const body = await apiRes.text()
    const durationMs = Date.now() - start

    if (!apiRes.ok) {
      log('warn', requestId, 'Upstream returned non-2xx response', {
        service,
        method: req.method,
        targetUrl,
        status: apiRes.status,
        statusText: apiRes.statusText,
        durationMs,
        responsePreview: safeBodyPreview(body),
      })
    } else {
      log('info', requestId, 'Proxy request succeeded', {
        service,
        method: req.method,
        targetUrl,
        status: apiRes.status,
        durationMs,
      })
    }

    res.status(apiRes.status)
    res.setHeader('Content-Type', apiRes.headers.get('content-type') ?? 'application/json')
    res.send(body)
  } catch (error) {
    const durationMs = Date.now() - start
    log('error', requestId, 'Proxy fetch failed', {
      service,
      method: req.method,
      targetUrl,
      durationMs,
      error: error instanceof Error ? error.message : String(error),
    })
    res.status(502).json({ error: 'Proxy error', requestId, details: String(error) })
  }
}
