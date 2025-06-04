import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfo as fetchUserInfo } from '../api/auth'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref({
    username: '',
    avatar: '',
    role: ''
  })
  
  const token = ref('')
  
  // 设置token
  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }
  
  // 获取token
  function getToken() {
    if (!token.value) {
      token.value = localStorage.getItem('token') || ''
    }
    return token.value
  }
  
  // 设置用户信息
  function setUserInfo(info) {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }
  
  // 从API获取用户信息
  async function fetchUserInfoFromApi() {
    if (!getToken()) return Promise.reject('No token, please login first')
    
    try {
      const res = await fetchUserInfo()
      if (res.code === 0 || res.code === 200) {
        setUserInfo(res.data)
        return res.data
      } else {
        return Promise.reject(res.message || 'Failed to get user info')
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return Promise.reject(error)
    }
  }
  
  // 初始化用户信息
  function initUserInfo() {
    // 从localStorage恢复用户信息
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo)
        userInfo.value = parsedUserInfo
      } catch (e) {
        console.error('解析存储的用户信息失败:', e)
      }
    }
    
    // 如果有token但没有用户信息，尝试从API获取
    if (getToken() && (!userInfo.value.username || !userInfo.value.role)) {
      fetchUserInfoFromApi().catch(err => {
        console.warn('自动获取用户信息失败:', err)
      })
    }
  }
  
  // 登出
  function logout() {
    token.value = ''
    userInfo.value = {
      username: '',
      avatar: '',
      role: ''
    }
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }
  
  // 初始化
  initUserInfo()
  
  return {
    userInfo,
    token,
    setToken,
    getToken,
    setUserInfo,
    fetchUserInfoFromApi,
    logout
  }
}) 