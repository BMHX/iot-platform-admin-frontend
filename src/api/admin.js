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
  })
} 