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
  
  // 设置设备列表
  function setDeviceList(list) {
    deviceList.value = list
  }
  
  // 设置设备统计信息
  function setDeviceStats(stats) {
    deviceTotal.value = stats.total || 0
    onlineDeviceCount.value = stats.online || 0
    offlineDeviceCount.value = stats.offline || 0
    alarmDeviceCount.value = stats.alarm || 0
  }
  
  return {
    deviceList,
    deviceTotal,
    onlineDeviceCount,
    offlineDeviceCount,
    alarmDeviceCount,
    setDeviceList,
    setDeviceStats
  }
}) 