import axios from 'axios';
import * as mockDataService from './mockDataService';

// 拦截器匹配规则
const mockRules = [
  {
    url: '/iot/dashboard/overview',
    method: 'get',
    response: mockDataService.getMockOverview
  },
  {
    url: '/iot/dashboard/device-status',
    method: 'get',
    response: mockDataService.getMockDeviceStatus
  },
  {
    url: '/iot/dashboard/tenant-types',
    method: 'get',
    response: mockDataService.getMockTenantTypes
  },
  {
    url: '/iot/dashboard/device-geo',
    method: 'get',
    response: mockDataService.getMockDeviceGeo
  },
  {
    url: '/iot/dashboard/device-growth',
    method: 'get',
    response: mockDataService.getMockDeviceGrowth
  },
  {
    url: '/iot/dashboard/alert-levels',
    method: 'get',
    response: mockDataService.getMockAlertLevels
  },
  {
    url: '/iot/dashboard/realtime-alerts',
    method: 'get',
    response: mockDataService.getMockRealtimeAlerts
  }
];

/**
 * 设置axios拦截器
 * @param {Object} instance - axios实例
 */
export function setupMockInterceptor(instance) {
  // 添加响应拦截器
  instance.interceptors.response.use(
    response => response, // 不拦截正常响应
    error => {
      if (error.config) {
        // 检查是否为网络错误或其他可能被mock的错误
        if (error.message.includes('Network Error') || error.response?.status === 404) {
          // 尝试匹配mock规则
          const rule = findMatchingRule(error.config);
          if (rule) {
            console.log('使用Mock数据拦截请求:', error.config.url);
            // 返回mock数据
            return Promise.resolve({
              data: rule.response(),
              status: 200,
              statusText: 'OK',
              headers: {},
              config: error.config,
              request: error.request
            });
          }
        }
      }
      // 不匹配任何规则，继续抛出错误
      return Promise.reject(error);
    }
  );
}

/**
 * 查找匹配的mock规则
 * @param {Object} config - 请求配置
 * @returns {Object|null} 匹配的规则或null
 */
function findMatchingRule(config) {
  return mockRules.find(rule => {
    const urlMatch = config.url.endsWith(rule.url);
    const methodMatch = config.method.toLowerCase() === rule.method.toLowerCase();
    return urlMatch && methodMatch;
  });
}

export default setupMockInterceptor; 