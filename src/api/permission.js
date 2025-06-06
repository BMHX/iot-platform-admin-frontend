import request from '../utils/request'

/**
 * 分页获取权限列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getPermissionList(params) {
  return request({
    url: '/iot/permission/page',
    method: 'get',
    params
  }).then(res => {
    console.log('获取权限列表响应:', res)
    return res
  }).catch(err => {
    console.error('获取权限列表错误:', err)
    throw err
  })
}

/**
 * 获取所有权限列表（不分页）
 * @returns {Promise}
 */
export function getAllPermissions() {
  return request({
    url: '/iot/permission/list',
    method: 'get'
  }).then(res => {
    console.log('获取所有权限响应:', res)
    return res
  }).catch(err => {
    console.error('获取所有权限错误:', err)
    throw err
  })
}

/**
 * 获取权限详情
 * @param {Number} id - 权限ID
 * @returns {Promise}
 */
export function getPermissionDetail(id) {
  return request({
    url: `/iot/permission/${id}`,
    method: 'get'
  }).then(res => {
    console.log('获取权限详情响应:', res)
    return res
  }).catch(err => {
    console.error('获取权限详情错误:', err)
    throw err
  })
}

/**
 * 添加权限
 * @param {Object} data - 权限数据
 * @returns {Promise}
 */
export function addPermission(data) {
  return request({
    url: '/iot/permission',
    method: 'post',
    data
  }).then(res => {
    console.log('添加权限响应:', res)
    return res
  }).catch(err => {
    console.error('添加权限错误:', err)
    throw err
  })
}

/**
 * 更新权限
 * @param {Object} data - 权限数据
 * @returns {Promise}
 */
export function updatePermission(data) {
  return request({
    url: '/iot/permission',
    method: 'put',
    data
  }).then(res => {
    console.log('更新权限响应:', res)
    return res
  }).catch(err => {
    console.error('更新权限错误:', err)
    throw err
  })
}

/**
 * 删除权限
 * @param {Number} id - 权限ID
 * @returns {Promise}
 */
export function deletePermission(id) {
  return request({
    url: `/iot/permission/${id}`,
    method: 'delete'
  }).then(res => {
    console.log('删除权限响应:', res)
    return res
  }).catch(err => {
    console.error('删除权限错误:', err)
    throw err
  })
}

/**
 * 分页获取权限套餐列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getPricesList(params) {
  return request({
    url: '/iot/prices/page',
    method: 'get',
    params
  }).then(res => {
    console.log('获取权限套餐列表响应:', res)
    return res
  }).catch(err => {
    console.error('获取权限套餐列表错误:', err)
    throw err
  })
}

/**
 * 获取所有权限套餐列表（不分页）
 * @returns {Promise}
 */
export function getAllPrices() {
  return request({
    url: '/iot/prices/list',
    method: 'get'
  }).then(res => {
    console.log('获取所有权限套餐响应:', res)
    return res
  }).catch(err => {
    console.error('获取所有权限套餐错误:', err)
    throw err
  })
}

/**
 * 获取权限套餐详情
 * @param {Number} id - 权限套餐ID
 * @returns {Promise}
 */
export function getPricesDetail(id) {
  return request({
    url: `/iot/prices/${id}`,
    method: 'get'
  }).then(res => {
    console.log('获取权限套餐详情响应:', res)
    return res
  }).catch(err => {
    console.error('获取权限套餐详情错误:', err)
    throw err
  })
}

/**
 * 添加权限套餐
 * @param {Object} data - 权限套餐数据
 * @returns {Promise}
 */
export function addPrices(data) {
  return request({
    url: '/iot/prices',
    method: 'post',
    data
  }).then(res => {
    console.log('添加权限套餐响应:', res)
    return res
  }).catch(err => {
    console.error('添加权限套餐错误:', err)
    throw err
  })
}

/**
 * 更新权限套餐
 * @param {Object} data - 权限套餐数据
 * @returns {Promise}
 */
export function updatePrices(data) {
  return request({
    url: '/iot/prices',
    method: 'put',
    data
  }).then(res => {
    console.log('更新权限套餐响应:', res)
    return res
  }).catch(err => {
    console.error('更新权限套餐错误:', err)
    throw err
  })
}

/**
 * 删除权限套餐
 * @param {Number} id - 权限套餐ID
 * @returns {Promise}
 */
export function deletePrices(id) {
  return request({
    url: `/iot/prices/${id}`,
    method: 'delete'
  }).then(res => {
    console.log('删除权限套餐响应:', res)
    return res
  }).catch(err => {
    console.error('删除权限套餐错误:', err)
    throw err
  })
}

/**
 * 为管理员分配权限套餐
 * @param {Number} adminId - 管理员ID
 * @param {Number} permissionId - 权限套餐ID
 * @returns {Promise}
 */
export function assignAdminPermission(adminId, permissionId) {
  return request({
    url: `/api/admin/${adminId}/permission/${permissionId}`,
    method: 'post'
  }).then(res => {
    console.log('分配管理员权限套餐响应:', res)
    return res
  }).catch(err => {
    console.error('分配管理员权限套餐错误:', err)
    throw err
  })
}

/**
 * 更新管理员的权限套餐
 * @param {Number} adminId - 管理员ID
 * @param {Number} permissionId - 权限套餐ID
 * @returns {Promise}
 */
export function updateAdminPermission(adminId, permissionId) {
  return request({
    url: `/api/admin/${adminId}/permission/${permissionId}`,
    method: 'put'
  }).then(res => {
    console.log('更新管理员权限套餐响应:', res)
    return res
  }).catch(err => {
    console.error('更新管理员权限套餐错误:', err)
    throw err
  })
}

/**
 * 移除管理员的权限套餐
 * @param {Number} adminId - 管理员ID
 * @returns {Promise}
 */
export function removeAdminPermission(adminId) {
  return request({
    url: `/api/admin/${adminId}/permission`,
    method: 'delete'
  }).then(res => {
    console.log('移除管理员权限套餐响应:', res)
    return res
  }).catch(err => {
    console.error('移除管理员权限套餐错误:', err)
    throw err
  })
}

/**
 * 获取管理员的权限套餐信息
 * @param {Number} adminId - 管理员ID
 * @returns {Promise}
 */
export function getAdminPermission(adminId) {
  return request({
    url: `/api/admin/${adminId}/permission`,
    method: 'get'
  }).then(res => {
    console.log('获取管理员权限套餐响应:', res)
    return res
  }).catch(err => {
    console.error('获取管理员权限套餐错误:', err)
    throw err
  })
} 