import request from '../utils/request'

/**
 * 获取权限列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getPermissionList(params) {
  return request({
    url: '/api/permission',
    method: 'get',
    params
  })
}

/**
 * 获取权限详情
 * @param {Number} id - 权限ID
 * @returns {Promise}
 */
export function getPermissionDetail(id) {
  return request({
    url: `/api/permission/${id}`,
    method: 'get'
  })
}

/**
 * 添加权限
 * @param {Object} data - 权限数据
 * @returns {Promise}
 */
export function addPermission(data) {
  return request({
    url: '/api/permission',
    method: 'post',
    data
  })
}

/**
 * 更新权限
 * @param {Number} id - 权限ID
 * @param {Object} data - 权限数据
 * @returns {Promise}
 */
export function updatePermission(id, data) {
  return request({
    url: `/api/permission/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除权限
 * @param {Number} id - 权限ID
 * @returns {Promise}
 */
export function deletePermission(id) {
  return request({
    url: `/api/permission/${id}`,
    method: 'delete'
  })
} 