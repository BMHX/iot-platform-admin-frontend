import request from '../utils/request'

/**
 * 获取数据大屏概览数据
 * @returns {Promise}
 */
export function getDataScreenOverview() {
  return request({
    url: '/iot/dashboard/overview',
    method: 'get'
  })
}

/**
 * 获取设备状态分布数据
 * @returns {Promise}
 */
export function getDeviceStatusDistribution() {
  return request({
    url: '/iot/dashboard/device-status',
    method: 'get'
  })
}

/**
 * 获取租户类型分布数据
 * @returns {Promise}
 */
export function getTenantTypeDistribution() {
  return request({
    url: '/iot/dashboard/tenant-types',
    method: 'get'
  })
}

/**
 * 获取设备地理分布数据
 * @returns {Promise}
 */
export function getDeviceGeoDistribution() {
  return request({
    url: '/iot/dashboard/device-geo',
    method: 'get'
  })
}

/**
 * 获取设备增长趋势数据
 * @returns {Promise}
 */
export function getDeviceGrowthTrend() {
  return request({
    url: '/iot/dashboard/device-growth',
    method: 'get'
  })
}

/**
 * 获取告警级别分布数据
 * @returns {Promise}
 */
export function getAlertLevelDistribution() {
  return request({
    url: '/iot/dashboard/alert-levels',
    method: 'get'
  })
}

/**
 * 获取实时告警数据
 * @returns {Promise}
 */
export function getRealtimeAlerts() {
  return request({
    url: '/iot/dashboard/realtime-alerts',
    method: 'get'
  })
}

/**
 * 获取设备类型分布数据
 * @returns {Promise}
 */
export function getDeviceTypeDistribution() {
  return request({
    url: '/iot/dashboard/device-types',
    method: 'get'
  })
} 