/**
 * Mock数据服务
 * 用于模拟后端API返回的数据
 */

// 设备总数据
export const mockDeviceTotal = 5283;

// 概览数据
export function getMockOverview() {
  return {
    code: 200,
    data: {
      deviceTotal: mockDeviceTotal,
      onlineDeviceCount: 4752,
      alertCount: 356,
      tenantCount: 89
    },
    message: "操作成功"
  };
}

// 设备状态分布
export function getMockDeviceStatus() {
  return {
    code: 200,
    data: [
      { value: 4752, name: '在线', itemStyle: { color: '#67C23A' } },
      { value: 320, name: '离线', itemStyle: { color: '#909399' } },
      { value: 145, name: '故障', itemStyle: { color: '#F56C6C' } },
      { value: 66, name: '维护中', itemStyle: { color: '#E6A23C' } }
    ],
    message: "操作成功"
  };
}

// 租户类型分布
export function getMockTenantTypes() {
  return {
    code: 200,
    data: [
      { value: 42, name: '学校', itemStyle: { color: '#4ECA8A' } },
      { value: 28, name: '小区', itemStyle: { color: '#409EFF' } },
      { value: 15, name: '驿站', itemStyle: { color: '#E6A23C' } },
      { value: 4, name: '其他', itemStyle: { color: '#909399' } }
    ],
    message: "操作成功"
  };
}

// 设备地理分布
export function getMockDeviceGeo() {
  return {
    code: 200,
    data: {
      devices: [
        { name: '北京', value: 156, coordinate: [116.405285, 39.904989] },
        { name: '上海', value: 138, coordinate: [121.472644, 31.231706] },
        { name: '广州', value: 120, coordinate: [113.280637, 23.125178] },
        { name: '深圳', value: 108, coordinate: [114.085947, 22.547] },
        { name: '杭州', value: 95, coordinate: [120.153576, 30.287459] },
        { name: '南京', value: 87, coordinate: [118.767413, 32.041544] },
        { name: '武汉', value: 82, coordinate: [114.298572, 30.584355] },
        { name: '成都', value: 78, coordinate: [104.065735, 30.659462] },
        { name: '西安', value: 72, coordinate: [108.948024, 34.263161] },
        { name: '重庆', value: 68, coordinate: [106.504962, 29.533155] }
      ],
      center: [104.5, 38]
    },
    message: "操作成功"
  };
}

// 设备增长趋势
export function getMockDeviceGrowth() {
  // 生成最近30天的日期
  const dates = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push(`${date.getMonth() + 1}/${date.getDate()}`);
  }
  
  // 模拟数据
  const deviceGrowthData = [4900, 4920, 4950, 4970, 5000, 5020, 5040, 5060, 5080, 5090, 
    5100, 5110, 5120, 5130, 5140, 5150, 5160, 5170, 5180, 5190, 
    5200, 5210, 5220, 5230, 5240, 5250, 5260, 5270, 5280, 5283];
  
  const newDeviceData = [];
  for (let i = 0; i < deviceGrowthData.length; i++) {
    if (i === 0) {
      newDeviceData.push(deviceGrowthData[i]);
    } else {
      newDeviceData.push(deviceGrowthData[i] - deviceGrowthData[i-1]);
    }
  }
  
  return {
    code: 200,
    data: {
      dates: dates,
      deviceGrowthData: deviceGrowthData,
      newDeviceData: newDeviceData
    },
    message: "操作成功"
  };
}

// 告警级别分布
export function getMockAlertLevels() {
  return {
    code: 200,
    data: [
      { value: 45, name: '紧急', itemStyle: { color: '#F56C6C' } },
      { value: 78, name: '重要', itemStyle: { color: '#E6A23C' } },
      { value: 125, name: '次要', itemStyle: { color: '#4ECA8A' } },
      { value: 108, name: '提示', itemStyle: { color: '#909399' } }
    ],
    message: "操作成功"
  };
}

// 实时告警数据
export function getMockRealtimeAlerts() {
  return {
    code: 200,
    data: [
      { time: '10:28:35', content: '设备DEV20230005离线', level: 'warning' },
      { time: '10:15:42', content: '设备DEV20230008温度超过阈值', level: 'danger' },
      { time: '09:56:18', content: '设备DEV20230012连接异常', level: 'warning' },
      { time: '09:42:05', content: '设备DEV20230003数据异常', level: 'info' },
      { time: '09:30:56', content: '设备DEV20230015电量低', level: 'warning' }
    ],
    message: "操作成功"
  };
}

// 生成随机告警
export function generateRandomAlert() {
  const deviceIds = ['DEV20230001', 'DEV20230002', 'DEV20230003', 'DEV20230004', 'DEV20230005'];
  const alertTypes = [
    { content: '离线', level: 'warning' },
    { content: '温度超过阈值', level: 'danger' },
    { content: '连接异常', level: 'warning' },
    { content: '数据异常', level: 'info' },
    { content: '电量低', level: 'warning' }
  ];
  
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}:${seconds}`;
  
  const deviceId = deviceIds[Math.floor(Math.random() * deviceIds.length)];
  const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
  
  return {
    time: timeStr,
    content: `设备${deviceId}${alertType.content}`,
    level: alertType.level
  };
} 