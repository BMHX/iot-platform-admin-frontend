import request from '@/utils/request'

/**
 * 获取协议分页列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getProtocolPage(params) {
  console.log('调用getProtocolPage API，参数:', params)
  return request({
    url: '/admin/protocol/page',
    method: 'get',
    params
  })
}

/**
 * 获取协议列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getProtocolList(params) {
  console.log('调用getProtocolList API，参数:', params)
  return request({
    url: '/admin/protocol/list',
    method: 'get',
    params
  })
}

/**
 * 获取协议详情
 * @param {Number} id - 协议ID
 * @returns {Promise}
 */
export function getProtocolById(id) {
  return request({
    url: `/admin/protocol/${id}`,
    method: 'get'
  })
}

/**
 * 创建协议
 * @param {Object} data - 协议数据
 * @returns {Promise}
 */
export function createProtocol(data) {
  return request({
    url: '/admin/protocol',
    method: 'post',
    data
  })
}

/**
 * 更新协议
 * @param {Number} id - 协议ID
 * @param {Object} data - 协议数据
 * @returns {Promise}
 */
export function updateProtocol(id, data) {
  return request({
    url: `/admin/protocol/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除协议
 * @param {Number} id - 协议ID
 * @returns {Promise}
 */
export function deleteProtocol(id) {
  return request({
    url: `/admin/protocol/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除协议
 * @param {Array} ids - 协议ID列表
 * @returns {Promise}
 */
export function batchDeleteProtocol(ids) {
  return request({
    url: '/admin/protocol/batch',
    method: 'delete',
    data: ids
  })
}

/**
 * 更新协议状态
 * @param {Number} id - 协议ID
 * @param {Number} status - 状态，1表示启用，0表示禁用
 * @returns {Promise}
 */
export function updateProtocolStatus(id, status) {
  console.log('调用updateProtocolStatus API，参数:', { id, status })
  return request({
    url: `/admin/protocol/${id}/status`,
    method: 'put',
    data: { status: Number(status) }  // 确保status是数字类型
  })
}

/**
 * 保存协议配置
 * @param {Number} id - 协议ID
 * @param {Object} config - 配置信息对象
 * @returns {Promise}
 */
export function saveProtocolConfig(id, config) {
  console.log('调用saveProtocolConfig API，参数:', { id, config });
  
  return request({
    url: `/admin/protocol/${id}/config`,
    method: 'put',
    data: { config }
  });
}

/**
 * 获取版本分页列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getVersionPage(params) {
  console.log('调用getVersionPage API，参数:', params)
  return request({
    url: '/admin/version/page',
    method: 'get',
    params
  })
}

/**
 * 获取版本列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getVersionList(params) {
  console.log('调用getVersionList API，参数:', params)
  return request({
    url: '/admin/version/list',
    method: 'get',
    params
  })
}

/**
 * 获取版本详情
 * @param {Number} id - 版本ID
 * @returns {Promise}
 */
export function getVersionById(id) {
  return request({
    url: `/admin/version/${id}`,
    method: 'get'
  })
}

/**
 * 创建版本
 * @param {Object} data - 版本数据
 * @returns {Promise}
 */
export function createVersion(data) {
  return request({
    url: '/admin/version',
    method: 'post',
    data
  })
}

/**
 * 更新版本
 * @param {Number} id - 版本ID
 * @param {Object} data - 版本数据
 * @returns {Promise}
 */
export function updateVersion(id, data) {
  return request({
    url: `/admin/version/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除版本
 * @param {Number} id - 版本ID
 * @returns {Promise}
 */
export function deleteVersion(id) {
  return request({
    url: `/admin/version/${id}`,
    method: 'delete'
  })
}

/**
 * 设置激活版本
 * @param {Number} id - 版本ID
 * @returns {Promise}
 */
export function setActiveVersion(id) {
  return request({
    url: `/admin/version/${id}/active`,
    method: 'put'
  })
}

/**
 * 导出版本日志
 * @returns {Promise}
 */
export function exportVersionLog() {
  return request({
    url: '/admin/version/log/export',
    method: 'get',
    responseType: 'blob'
  })
} 