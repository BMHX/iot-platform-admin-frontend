import axios from 'axios'
import { ElMessage } from 'element-plus'
import { setupMockInterceptor } from './mockInterceptor'
import router from '../router'

// 创建axios实例
const service = axios.create({
  baseURL: '/', // 使用相对路径，会通过Vite代理转发到后端服务
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 是否正在刷新token
let isRefreshing = false
// 重试队列
let retryQueue = []

// 请求拦截器
service.interceptors.request.use(
  config => {
    console.log('==== 发送请求 ====')
    console.log('URL:', config.url)
    console.log('Method:', config.method)
    console.log('Params:', config.params)
    console.log('Data:', config.data)
    console.log('Headers:', config.headers)
    
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // 标记数据大屏相关请求，用于特殊处理
    if (config.url && config.url.includes('/dashboard')) {
      config.isDashboardRequest = true
    }
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    console.log('==== 收到响应 ====')
    console.log('URL:', response.config.url)
    console.log('Status:', response.status)
    console.log('Data:', response.data)
    
    const res = response.data
    
    // 根据自定义错误码判断请求是否成功
    if (res.code !== 0 && res.code !== 200) {
      // 401: 未登录或token过期
      if (res.code === 401) {
        // 对于数据大屏请求，使用本地缓存数据
        if (response.config.isDashboardRequest) {
          const cacheKey = `dashboard_cache_${response.config.url}`
          const cachedData = localStorage.getItem(cacheKey)
          
          if (cachedData) {
            console.log('使用缓存数据:', response.config.url)
            return JSON.parse(cachedData)
          }
        }
        
        // 处理token过期
        return handleTokenExpired(response.config)
      }
      
      // 显示错误信息
      ElMessage({
        message: res.message || res.msg || '请求失败',
        type: 'error',
        duration: 5 * 1000
      })
      
      return Promise.reject(res.message || res.msg || '请求失败')
    } else {
      // 对于数据大屏请求，缓存成功响应
      if (response.config.isDashboardRequest) {
        const cacheKey = `dashboard_cache_${response.config.url}`
        localStorage.setItem(cacheKey, JSON.stringify(res))
      }
      
      return res
    }
  },
  error => {
    // 对于数据大屏请求，如果失败则尝试使用缓存数据
    if (error.config && error.config.isDashboardRequest) {
      const cacheKey = `dashboard_cache_${error.config.url}`
      const cachedData = localStorage.getItem(cacheKey)
      
      if (cachedData) {
        console.log('请求失败，使用缓存数据:', error.config.url)
        return Promise.resolve(JSON.parse(cachedData))
      }
    }
    
    // 401错误，可能是token过期
    if (error.response && error.response.status === 401) {
      return handleTokenExpired(error.config)
    }
    
    ElMessage({
      message: error.message || '请求失败',
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

// 处理token过期
function handleTokenExpired(config) {
  if (!isRefreshing) {
    isRefreshing = true
    
    // 尝试使用刷新token API获取新token
    // 这里假设有一个刷新token的API
    // 如果没有，则直接跳转到登录页
    
    // 简化处理：直接跳转到登录页
    if (!window.location.pathname.includes('/login')) {
      // 保存当前路径，登录后可以跳回
      localStorage.setItem('redirect', router.currentRoute.value.fullPath)
      
      // 清除token
      localStorage.removeItem('token')
      
      // 如果不是数据大屏页面，则跳转到登录页
      if (!window.location.pathname.includes('/data-screen')) {
        router.push('/login')
      }
    }
    
    isRefreshing = false
    return Promise.reject('登录已过期，请重新登录')
  }
  
  // 将请求加入重试队列
  return new Promise(resolve => {
    retryQueue.push(() => {
      resolve(service(config))
    })
  })
}

// 设置Mock拦截器
setupMockInterceptor(service)

export default service 