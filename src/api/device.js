import request from '../utils/request'

/**
 * 分页获取设备列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getDeviceList(params) {
  return request({
    url: '/iot/devices/page',
    method: 'get',
    params
  })
}

/**
 * 获取所有设备列表（不分页）
 * @returns {Promise}
 */
export function getAllDevices() {
  return request({
    url: '/iot/devices/list',
    method: 'get'
  })
}

/**
 * 获取设备详情
 * @param {String|Number} id - 设备ID
 * @returns {Promise}
 */
export function getDeviceDetail(id) {
  return request({
    url: `/iot/devices/${id}`,
    method: 'get'
  })
}

/**
 * 添加设备
 * @param {Object} data - 设备数据
 * @returns {Promise}
 */
export function addDevice(data) {
  return request({
    url: '/iot/devices',
    method: 'post',
    data
  })
}

/**
 * 更新设备信息
 * @param {String|Number} id - 设备ID
 * @param {Object} data - 设备数据
 * @returns {Promise}
 */
export function updateDevice(id, data) {
  return request({
    url: `/iot/devices/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除设备
 * @param {String|Number} id - 设备ID
 * @returns {Promise}
 */
export function deleteDevice(id) {
  return request({
    url: `/iot/devices/${id}`,
    method: 'delete'
  })
} 