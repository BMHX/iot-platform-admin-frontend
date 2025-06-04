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
    console.log('发送请求:', config.url, config.method, config.params || config.data)
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
    const res = response.data
    console.log('收到响应:', response.config.url, res)
    
    // 根据自定义错误码判断请求是否成功
    if (res.code !== 0 && res.code !== 200) {
      // 显示错误信息
      ElMessage({
        message: res.message || '请求失败',
        type: 'error',
        duration: 5 * 1000
      })
      
      // 401: 未登录或token过期
      if (res.code === 401) {
        // 可以在此处理登出逻辑
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      
      return Promise.reject(res.message || '请求失败')
    } else {
      return res
    }
  },
  error => {
    console.error('响应错误:', error)
    // 获取更详细的错误信息
    const errorInfo = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: error.config
    }
    console.error('错误详情:', errorInfo)
    
    ElMessage({
      message: error.message || '请求失败',
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service 