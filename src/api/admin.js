import request from '../utils/request'

/**
 * 获取管理员列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getAdminList(params) {
  return request({
    url: '/api/admin',
    method: 'get',
    params
  }).then(res => {
    console.log('获取管理员列表响应:', res)
    // 确保返回的数据符合预期格式
    if (res && res.data && !Array.isArray(res.data) && !res.data.list) {
      // 直接返回数据，不是数组也不是包含list属性的对象
      // 这符合后端 Result<List<AdminVO>> 的返回格式
      console.log('后端返回的管理员列表数据格式正确')
    }
    return res
  }).catch(err => {
    console.error('获取管理员列表错误:', err)
    throw err
  })
}

/**
 * 获取管理员详情
 * @param {Number} id - 管理员ID
 * @returns {Promise}
 */
export function getAdminDetail(id) {
  return request({
    url: `/api/admin/${id}`,
    method: 'get'
  }).then(res => {
    console.log('获取管理员详情响应:', res)
    return res
  }).catch(err => {
    console.error('获取管理员详情错误:', err)
    throw err
  })
}

/**
 * 添加管理员
 * @param {Object} data - 管理员数据
 * @returns {Promise}
 */
export function addAdmin(data) {
  return request({
    url: '/api/admin/save',
    method: 'post',
    data
  }).then(res => {
    console.log('添加管理员响应:', res)
    return res
  }).catch(err => {
    console.error('添加管理员错误:', err)
    throw err
  })
}

/**
 * 更新管理员信息
 * @param {Object} data - 管理员数据
 * @returns {Promise}
 */
export function updateAdmin(data) {
  return request({
    url: '/api/admin/update',
    method: 'put',
    data
  }).then(res => {
    console.log('更新管理员响应:', res)
    return res
  }).catch(err => {
    console.error('更新管理员错误:', err)
    throw err
  })
}

/**
 * 删除管理员
 * @param {Number} id - 管理员ID
 * @returns {Promise}
 */
export function deleteAdmin(id) {
  return request({
    url: `/api/admin/delete/${id}`,
    method: 'delete'
  }).then(res => {
    console.log('删除管理员响应:', res)
    return res
  }).catch(err => {
    console.error('删除管理员错误:', err)
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
 * 修改管理员的权限套餐
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



 