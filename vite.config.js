import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const proxyTarget = 'https://wms-backend-4kx1.onrender.com'

const attachProxyLogger = (proxy, label) => {
  proxy.on('proxyReq', (proxyReq, req) => {
    const host = proxyReq.getHeader('host')
    const path = proxyReq.path || req.url
    console.log(`[proxy:${label}] ${req.method} ${req.url} -> ${host || ''}${path || ''}`)
  })
  proxy.on('proxyRes', (proxyRes, req) => {
    console.log(`[proxy:${label}] ${req.method} ${req.url} <- ${proxyRes.statusCode}`)
  })
  proxy.on('error', (err, req) => {
    console.error(`[proxy:${label}] ${req.method} ${req.url} !! ${err.message}`)
  })
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: true,
        configure: (proxy) => attachProxyLogger(proxy, 'api'),
      },
      '/uploads': {
        target: proxyTarget,
        changeOrigin: true,
        secure: true,
        configure: (proxy) => attachProxyLogger(proxy, 'uploads'),
      },
    },
  },
})
