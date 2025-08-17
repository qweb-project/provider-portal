import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
// import basicSsl from '@vitejs/plugin-basic-ssl'
import apiApp from './src/api/server'

export default defineConfig({
  plugins: [
    // basicSsl(),
    TanStackRouterVite({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
    {
      name: 'local-api-middleware',
      configureServer(server) {
        server.middlewares.use('/api', async (req, res) => {
          try {
            const url = `http://localhost${req.url || '/api'}`
            const method = req.method || 'GET'

            const chunks: Buffer[] = []
            await new Promise<void>((resolve) => {
              req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
              req.on('end', () => resolve())
            })

            const body = chunks.length ? Buffer.concat(chunks) : undefined
            const request = new Request(url, {
              method,
              headers: req.headers as any,
              body: body && method !== 'GET' && method !== 'HEAD' ? body : undefined,
            })

            const response = await apiApp.fetch(request)
            res.statusCode = response.status
            response.headers.forEach((value, key) => res.setHeader(key, value))
            const arrayBuffer = await response.arrayBuffer()
            res.end(Buffer.from(arrayBuffer))
          } catch (err) {
            res.statusCode = 500
            res.end((err as Error)?.message || 'Internal Server Error')
          }
        })
      },
      configurePreviewServer(server) {
        server.middlewares.use('/api', async (req, res) => {
          try {
            const url = `http://localhost${req.url || '/api'}`
            const method = req.method || 'GET'

            const chunks: Buffer[] = []
            await new Promise<void>((resolve) => {
              req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
              req.on('end', () => resolve())
            })

            const body = chunks.length ? Buffer.concat(chunks) : undefined
            const request = new Request(url, {
              method,
              headers: req.headers as any,
              body: body && method !== 'GET' && method !== 'HEAD' ? body : undefined,
            })

            const response = await apiApp.fetch(request)
            res.statusCode = response.status
            response.headers.forEach((value, key) => res.setHeader(key, value))
            const arrayBuffer = await response.arrayBuffer()
            res.end(Buffer.from(arrayBuffer))
          } catch (err) {
            res.statusCode = 500
            res.end((err as Error)?.message || 'Internal Server Error')
          }
        })
      },
    },
  ],
  server: {
    port: 3000,
    // https: true,
    // With local-api-middleware, we no longer need a proxy for /api in dev
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
}) 