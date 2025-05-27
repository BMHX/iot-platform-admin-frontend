import { defineStore } from 'pinia'
import { ref } from 'vue'

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
  }
  
  return {
    userInfo,
    token,
    setToken,
    getToken,
    setUserInfo,
    logout
  }
}) 