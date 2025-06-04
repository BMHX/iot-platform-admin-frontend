import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getDeviceList, getAllDevices } from '../api/device'

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

  // 加载中状态
  const loading = ref(false)
  
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

  // 从API获取设备列表
  async function fetchDeviceList(params = {}) {
    loading.value = true
    try {
      const res = await getDeviceList(params)
      if (res.code === 0 || res.code === 200) {
        // 更新设备列表
        setDeviceList(res.data.list || [])
        deviceTotal.value = res.data.total || 0
        
        // 更新统计信息
        if (res.data.stats) {
          setDeviceStats(res.data.stats)
        } else {
          // 手动计算统计信息
          const stats = {
            total: deviceList.value.length,
            online: deviceList.value.filter(d => d.status === 'online').length,
            offline: deviceList.value.filter(d => d.status === 'offline').length,
            alarm: deviceList.value.filter(d => d.status === 'alarm').length
          }
          setDeviceStats(stats)
        }
        
        return res.data
      } else {
        console.error('获取设备列表失败:', res.message)
        return Promise.reject(res.message || '获取设备列表失败')
      }
    } catch (error) {
      console.error('获取设备列表异常:', error)
      return Promise.reject(error)
    } finally {
      loading.value = false
    }
  }

  // 从API获取所有设备（不分页）
  async function fetchAllDevices() {
    loading.value = true
    try {
      const res = await getAllDevices()
      if (res.code === 0 || res.code === 200) {
        return res.data || []
      } else {
        console.error('获取所有设备失败:', res.message)
        return Promise.reject(res.message || '获取所有设备失败')
      }
    } catch (error) {
      console.error('获取所有设备异常:', error)
      return Promise.reject(error)
    } finally {
      loading.value = false
    }
  }
  
  return {
    deviceList,
    deviceTotal,
    onlineDeviceCount,
    offlineDeviceCount,
    alarmDeviceCount,
    deviceLocations,
    loading,
    setDeviceList,
    setDeviceStats,
    addDeviceLocation,
    fetchDeviceList,
    fetchAllDevices
  }
}) 