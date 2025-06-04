import request from '../utils/request'

/**
 * 用户登录
 * @param {Object} data - 登录参数 {username, password}
 * @returns {Promise}
 */
export function login(data) {
  return request({
    url: '/api/admin/login',
    method: 'post',
    data
  })
}

/**
 * 用户登出
 * @returns {Promise}
 */
export function logout() {
  return request({
    url: '/api/admin/logout',
    method: 'post'
  })
}

/**
 * 获取用户信息
 * @returns {Promise}
 */
export function getUserInfo() {
  return request({
    url: '/api/admin/info',
    method: 'get'
  })
} 