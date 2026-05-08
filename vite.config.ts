import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load all .env vars (no prefix filter) so we can read SUBIEKT_* at config time
  const env = loadEnv(mode, process.cwd(), '')

  const subiektUrl     = env.SUBIEKT_API_URL     || 'https://subiekt-api.ngrok.app'
  const subiektKey     = env.SUBIEKT_API_KEY     || ''
  const gratyfikantUrl = env.GRATYFIKANT_API_URL || 'https://gratyfikant-api.ngrok.app'
  const gratyfikantKey = env.GRATYFIKANT_API_KEY || ''
  const rewizorUrl     = env.REWIZOR_API_URL     || 'https://rewizor-api.ngrok.dev'
  const rewizorKey     = env.REWIZOR_API_KEY     || ''
  const financeUrl     = env.FINANCE_API_URL     || 'https://financial.exactflow.ngrok.dev'
  const financeKey     = env.FINANCE_API_KEY     || ''

  // Custom middleware for Finance API — Vite's http-proxy doesn't follow
  // HTTP→HTTPS redirects; Node fetch does, so we handle it here instead.
  const financePlugin: Plugin = {
    name: 'finance-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/finance/')) return next()
        const path = req.url.replace(/^\/finance/, '')
        try {
          const apiRes = await fetch(`${financeUrl}${path}`, {
            headers: { 'x-api-key': financeKey, accept: 'application/json' },
          })
          const body = await apiRes.text()
          res.statusCode = apiRes.status
          res.setHeader('Content-Type', apiRes.headers.get('content-type') ?? 'application/json')
          res.end(body)
        } catch (e) {
          next(e)
        }
      })
    },
  }

  const rewizorProxy = {
    target: rewizorUrl,
    changeOrigin: true,
    secure: false,
    headers: { 'x-api-key': rewizorKey },
  }

  return {
    plugins: [react(), financePlugin],
    server: {
      host: '0.0.0.0',
      port: 3040,
      strictPort: false,
      allowedHosts: ['helped-overly-tahr.ngrok-free.app'],
      proxy: {
        // Legacy backend proxy (kept for non-Subiekt routes)
        '/api': {
          target: 'http://localhost:8001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        // Subiekt GT ERP API — x-api-key injected here, never in browser bundle
        '/subiekt': {
          target: subiektUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/subiekt/, ''),
          headers: { 'x-api-key': subiektKey },
        },
        // Rewizor
        '/rewizor': {
          ...rewizorProxy,
          rewrite: (path) => path.replace(/^\/rewizor/, ''),
        },
        // Finance API handled by financePlugin (follows HTTP→HTTPS redirects)
        // Gratyfikant HR/Payroll API
        '/gratyfikant': {
          target: gratyfikantUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/gratyfikant/, ''),
          headers: { 'x-api-key': gratyfikantKey },
        },
      },
    },
  }
})
