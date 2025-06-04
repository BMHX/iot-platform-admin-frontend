import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // 监听所有IP地址
    port: 3000, // 前端服务器端口
    open: true, // 自动打开浏览器
    proxy: {
      // 将所有 /api 开头的请求代理到后端服务
      '/api': {
        target: 'http://localhost:8086',
        changeOrigin: true,
        // 保留 /api 路径
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
      // 将所有 /iot 开头的请求代理到后端服务
      '/iot': {
        target: 'http://localhost:8086',
        changeOrigin: true,
        // 保留 /iot 路径
        // rewrite: (path) => path.replace(/^\/iot/, '')
      }
    }
  }
})
