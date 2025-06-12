import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  server: {
    host: '0.0.0.0', // 监听所有IP地址
    port: 3000, // 前端服务器端口
    open: true, // 自动打开浏览器
    proxy: {
      // 将所有 /api 开头的请求代理到后端服务
      '/api': {
        target: 'http://121.43.133.175',
        changeOrigin: true,
        secure: false
      },
      // 将所有 /iot 开头的请求代理到后端服务
      '/iot': {
        target: 'http://121.43.133.175',
        changeOrigin: true,
        secure: false
      },
      // 将所有 /admin 开头的请求代理到后端服务
      '/admin': {
        target: 'http://121.43.133.175',
        changeOrigin: true,
        secure: false
      }
    }
  },
  // 添加更多日志输出
  logLevel: 'info'
})
