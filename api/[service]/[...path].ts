import type { VercelRequest, VercelResponse } from '@vercel/node'

const SERVICE_CONFIG: Record<string, { urlEnv: string; keyEnv: string; defaultUrl: string }> = {
  subiekt:     { urlEnv: 'SUBIEKT_API_URL',     keyEnv: 'SUBIEKT_API_KEY',     defaultUrl: 'https://subiekt-api.ngrok.app' },
  gratyfikant: { urlEnv: 'GRATYFIKANT_API_URL', keyEnv: 'GRATYFIKANT_API_KEY', defaultUrl: 'https://gratyfikant-api.ngrok.app' },
  rewizor:     { urlEnv: 'REWIZOR_API_URL',     keyEnv: 'REWIZOR_API_KEY',     defaultUrl: 'https://rewizor-api.ngrok.dev' },
  finance:     { urlEnv: 'FINANCE_API_URL',     keyEnv: 'FINANCE_API_KEY',     defaultUrl: 'https://financial.exactflow.ngrok.dev' },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const service = req.query.service as string
  const pathParts = req.query.path as string[] | undefined

  const config = SERVICE_CONFIG[service]
  if (!config) {
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

  try {
    const apiRes = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'x-api-key': apiKey,
        'accept': 'application/json',
        ...(req.body && req.method !== 'GET' ? { 'content-type': 'application/json' } : {}),
      },
      body: req.body && req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    })

    const body = await apiRes.text()
    res.status(apiRes.status)
    res.setHeader('Content-Type', apiRes.headers.get('content-type') ?? 'application/json')
    res.send(body)
  } catch (error) {
    res.status(502).json({ error: 'Proxy error', details: String(error) })
  }
}
