import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDeviceStore = defineStore('device', () => {
  // 设备列表
  const deviceList = ref([])
  
  // 设备总数
  const deviceTotal = ref(0)
  
  // 在线设备数
  const onlineDeviceCount = ref(0)
  
  // 离线设备数
  const offlineDeviceCount = ref(0)
  
  // 告警设备数
  const alarmDeviceCount = ref(0)
  
  // 设备位置数据
  const deviceLocations = ref([])
  
  // 设置设备列表
  function setDeviceList(list) {
    deviceList.value = list
    
    // 提取设备位置信息
    deviceLocations.value = list
      .filter(device => device.latitude && device.longitude)
      .map(device => ({
        id: device.id,
        name: device.name,
        location: device.location,
        latitude: device.latitude,
        longitude: device.longitude,
        status: device.status
      }))
  }
  
  // 设置设备统计信息
  function setDeviceStats(stats) {
    deviceTotal.value = stats.total || 0
    onlineDeviceCount.value = stats.online || 0
    offlineDeviceCount.value = stats.offline || 0
    alarmDeviceCount.value = stats.alarm || 0
  }
  
  // 添加设备位置信息
  function addDeviceLocation(device) {
    if (!device.latitude || !device.longitude) return
    
    const locationInfo = {
      id: device.id,
      name: device.name,
      location: device.location,
      latitude: device.latitude,
      longitude: device.longitude,
      status: device.status
    }
    
    const index = deviceLocations.value.findIndex(loc => loc.id === device.id)
    if (index !== -1) {
      deviceLocations.value[index] = locationInfo
    } else {
      deviceLocations.value.push(locationInfo)
    }
  }
  
  return {
    deviceList,
    deviceTotal,
    onlineDeviceCount,
    offlineDeviceCount,
    alarmDeviceCount,
    deviceLocations,
    setDeviceList,
    setDeviceStats,
    addDeviceLocation
  }
}) 