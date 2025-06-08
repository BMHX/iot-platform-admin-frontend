import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service = axios.create({
  baseURL: '/', // 使用相对路径，会通过Vite代理转发到后端服务
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

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
      // 显示错误信息
      ElMessage({
        message: res.message || res.msg || '请求失败',
        type: 'error',
        duration: 5 * 1000
      })
      
      // 401: 未登录或token过期
      if (res.code === 401) {
        // 可以在此处理登出逻辑
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      
      return Promise.reject(res.message || res.msg || '请求失败')
    } else {
      return res
    }
  },
  error => {
    console.error('==== 响应错误 ====')
    console.error('错误信息:', error.message)
    
    // 获取更详细的错误信息
    if (error.response) {
      console.error('状态码:', error.response.status)
      console.error('响应数据:', error.response.data)
    }
    
    if (error.config) {
      console.error('请求配置:', {
        url: error.config.url,
        method: error.config.method,
        params: error.config.params,
        data: error.config.data
      })
    }
    
    ElMessage({
      message: error.message || '请求失败',
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service 