<template>
  <div class="data-screen" ref="dataScreenRef">
    <div class="screen-header">
      <div class="header-left"></div>
      <div class="header-title">
        <span class="title-prefix">IoT</span>
        <span class="title-main">物联网运营平台实时监控大屏</span>
        <span class="title-suffix">v2.0</span>
      </div>
      <div class="header-time">
        <i class="el-icon-timer"></i>
        {{ currentTime }}
      </div>
      
      <!-- 全屏模式下的退出按钮 -->
      <div v-if="isFullscreenActive" class="fullscreen-exit-btn" @click="exitFullscreen">
        <el-icon><Close /></el-icon>
      </div>
    </div>
    
    <div class="screen-content">
      <el-row :gutter="20">
        <!-- 左侧面板 -->
        <el-col :span="6">
          <div class="panel left-panel">
            <div class="panel-item">
              <div class="panel-header">
                <i class="el-icon-pie-chart"></i>
                设备状态分布
              </div>
              <div ref="deviceStatusChart" class="chart-container"></div>
            </div>
            <div class="panel-item">
              <div class="panel-header">
                <i class="el-icon-user"></i>
                租户类型分布
              </div>
              <div ref="tenantTypeChart" class="chart-container"></div>
            </div>
            <div class="panel-item">
              <div class="panel-header">
                <i class="el-icon-cpu"></i>
                设备类型分布
              </div>
              <div ref="deviceTypeChart" class="chart-container"></div>
            </div>
          </div>
        </el-col>
        
        <!-- 中间面板 -->
        <el-col :span="12">
          <div class="panel center-panel">
            <div class="data-overview">
              <div class="overview-item">
                <div class="item-icon device-icon">
                  <i class="el-icon-cpu"></i>
                </div>
                <div class="item-value">{{ deviceTotal }}</div>
                <div class="item-label">设备总数</div>
                <div class="item-progress">
                  <div class="progress-bar" style="width: 90%;"></div>
                </div>
              </div>
              <div class="overview-item">
                <div class="item-icon online-icon">
                  <i class="el-icon-connection"></i>
                </div>
                <div class="item-value">{{ onlineDeviceCount }}</div>
                <div class="item-label">在线设备</div>
                <div class="item-progress">
                  <div class="progress-bar" style="width: 85%;"></div>
                </div>
              </div>
              <div class="overview-item">
                <div class="item-icon alert-icon">
                  <i class="el-icon-warning"></i>
                </div>
                <div class="item-value">{{ alertCount }}</div>
                <div class="item-label">告警总数</div>
                <div class="item-progress">
                  <div class="progress-bar" style="width: 65%;"></div>
                </div>
              </div>
              <div class="overview-item">
                <div class="item-icon tenant-icon">
                  <i class="el-icon-office-building"></i>
                </div>
                <div class="item-value">{{ tenantCount }}</div>
                <div class="item-label">租户总数</div>
                <div class="item-progress">
                  <div class="progress-bar" style="width: 75%;"></div>
                </div>
              </div>
            </div>
            
            <div class="map-container">
              <div class="panel-header">
                <i class="el-icon-map-location"></i>
                设备地理分布
                <div class="panel-header-right">
                  <div class="panel-badge">
                    <span class="badge-dot"></span>
                    实时监控
                  </div>
                </div>
              </div>
              <div ref="mapChart" class="map-chart"></div>
            </div>
            
            <div class="panel-item">
              <div class="panel-header">
                <i class="el-icon-data-line"></i>
                近30天设备增长趋势
              </div>
              <div ref="deviceGrowthChart" class="chart-container"></div>
            </div>
          </div>
        </el-col>
        
        <!-- 右侧面板 -->
        <el-col :span="6">
          <div class="panel right-panel">
            <div class="panel-item">
              <div class="panel-header">
                <i class="el-icon-warning-outline"></i>
                告警级别分布
              </div>
              <div ref="alertLevelChart" class="chart-container"></div>
            </div>
            <div class="panel-item">
              <div class="panel-header">
                <i class="el-icon-bell"></i>
                实时告警信息
                <div class="panel-header-right">
                  <div class="alert-count">{{ realtimeAlerts.length }}</div>
                </div>
              </div>
              <div class="realtime-alerts">
                <div v-for="(alert, index) in realtimeAlerts" :key="index" class="alert-item" :class="'alert-' + alert.level">
                  <div class="alert-time">{{ alert.time }}</div>
                  <div class="alert-content">{{ alert.content }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
// 引入中国地图
import { registerMap } from 'echarts'
import chinaJson from '../../assets/map/china.json'
import { useDeviceStore } from '../../stores/device'
import { useRoute } from 'vue-router'
// 引入API
import { 
  getDataScreenOverview, 
  getDeviceStatusDistribution, 
  getTenantTypeDistribution,
  getDeviceGeoDistribution,
  getDeviceGrowthTrend,
  getAlertLevelDistribution,
  getRealtimeAlerts,
  getDeviceTypeDistribution
} from '../../api/dashboard'

const route = useRoute()
const deviceStore = useDeviceStore()

// 数据大屏DOM引用
const dataScreenRef = ref(null)

// 检测是否处于全屏模式
const isFullscreenActive = ref(false)

// 监听全屏状态变化
const handleFullscreenChange = () => {
  isFullscreenActive.value = !!document.fullscreenElement || 
                           !!document.webkitFullscreenElement || 
                           !!document.msFullscreenElement
  
  // 全屏状态变化时重新调整图表大小
  if (chartInstances.value.length > 0) {
    // 延迟一点时间等待DOM渲染完成
    setTimeout(() => {
      resizeAllCharts()
    }, 200)
  }
}

// 退出全屏
const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen().catch(err => {
      console.error(`Error attempting to exit fullscreen: ${err.message}`)
    })
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen()
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen()
  }
}

// 时间相关
const currentTime = ref(formatDateTime(new Date()))
// 移除定时器变量
const retryTimers = ref([]) // 保留数组但不再使用

// 数据统计
const deviceTotal = ref(0)
const onlineDeviceCount = ref(0)
const alertCount = ref(0)
const tenantCount = ref(0)

// 图表引用
const deviceStatusChart = ref(null)
const tenantTypeChart = ref(null)
const mapChart = ref(null)
const deviceGrowthChart = ref(null)
const alertLevelChart = ref(null)
const deviceTypeChart = ref(null)

// 保存所有图表实例的数组
const chartInstances = ref([])

// 实时告警信息
const realtimeAlerts = ref([])

// 加载状态
const loading = ref({
  overview: false,
  deviceStatus: false,
  tenantType: false,
  deviceGeo: false,
  deviceGrowth: false,
  alertLevel: false,
  realtimeAlerts: false,
  deviceType: false
})

// 格式化日期时间
function formatDateTime(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekDay = weekDays[date.getDay()]
  
  return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds} ${weekDay}`
}

// 更新时间函数，不再使用定时器，只更新一次
function updateTime() {
  currentTime.value = formatDateTime(new Date())
}

// 初始化设备状态分布图表
function initDeviceStatusChart(data) {
  if (!deviceStatusChart.value) return null
  
  // 确保容器可见
  if (deviceStatusChart.value.offsetHeight === 0 || deviceStatusChart.value.offsetWidth === 0) {
    console.warn('设备状态图表容器尺寸为0，无法初始化图表')
    // 延迟尝试初始化
    setTimeout(() => loadDeviceStatusDistribution(), 500)
    return null
  }
  
  const myChart = echarts.init(deviceStatusChart.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 'bottom',
      textStyle: {
        color: '#fff'
      },
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '设备状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#061d33',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  }
  
  myChart.setOption(option)
  return myChart
}

// 初始化租户类型分布图表
function initTenantTypeChart(data) {
  const chartDom = tenantTypeChart.value
  if (!chartDom) return null
  
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 'bottom',
      textStyle: {
        color: '#fff'
      },
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '租户类型',
        type: 'pie',
        radius: '60%',
        center: ['50%', '45%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          color: '#fff'
        }
      }
    ]
  }
  
  myChart.setOption(option)
  return myChart
}

// 初始化中国地图
function initMapChart(deviceData, center = [104.5, 38]) {
  const chartDom = mapChart.value
  if (!chartDom) return null
  
  const myChart = echarts.init(chartDom)
  
  // 注册中国地图
  registerMap('china', chinaJson)
  
  // 创建连接线数据
  const links = generateLinks(deviceData)
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 台设备'
    },
    visualMap: {
      show: true,
      min: 0,
      max: 200,
      calculable: true,
      inRange: {
        color: ['#4ECA8A', '#409EFF', '#E6A23C', '#F56C6C']
      },
      textStyle: {
        color: '#fff'
      },
      left: 'left',
      bottom: 'bottom'
    },
    geo: {
      map: 'china',
      roam: true, // 允许缩放和平移
      center: center, // 地图中心点
      zoom: 1.2, // 缩放级别
      scaleLimit: {
        min: 1,
        max: 3
      },
      label: {
        show: false,
        color: '#fff',
        fontSize: 10
      },
      itemStyle: {
        areaColor: 'rgba(6, 30, 60, 0.8)',
        borderColor: 'rgba(91, 212, 255, 0.5)',
        borderWidth: 1,
        shadowColor: 'rgba(0, 183, 255, 0.3)',
        shadowBlur: 10
      },
      emphasis: {
        itemStyle: {
          areaColor: 'rgba(6, 50, 90, 0.9)',
          borderWidth: 1.5,
          shadowBlur: 20
        },
        label: {
          show: true,
          color: '#fff'
        }
      }
    },
    series: [
      {
        name: '设备分布',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: deviceData.map(item => ({
          name: item.name,
          value: [...item.coordinate, item.value]
        })),
        symbolSize: function(val) {
          return Math.min(val[2] / 2.5, 35);
        },
        itemStyle: {
          color: function(params) {
            const value = params.data.value[2];
            if (value > 150) return '#F56C6C';
            if (value > 100) return '#E6A23C';
            if (value > 80) return '#409EFF';
            return '#4ECA8A';
          },
          borderColor: 'rgba(255, 255, 255, 0.5)',
          borderWidth: 2,
          shadowColor: 'rgba(0, 183, 255, 0.8)',
          shadowBlur: 10
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{b}',
          color: '#fff',
          backgroundColor: 'rgba(6, 42, 75, 0.6)',
          borderRadius: 3,
          padding: [3, 5],
          distance: 10,
          fontSize: 12
        },
        emphasis: {
          scale: true,
          scaleSize: 5,
          itemStyle: {
            borderWidth: 3,
            shadowBlur: 20
          }
        },
        zlevel: 2
      },
      {
        name: '数据中心',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: [{
          name: '数据中心',
          value: [center[0], center[1], 200] // 放在地图中心位置
        }],
        symbolSize: 25,
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'stroke',
          scale: 5,
          period: 4
        },
        itemStyle: {
          color: '#00b7ff',
          shadowBlur: 15,
          shadowColor: 'rgba(0, 183, 255, 0.8)'
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{b}',
          color: '#fff',
          distance: 10,
          fontSize: 14,
          fontWeight: 'bold'
        },
        zlevel: 3
      },
      {
        name: '连接线',
        type: 'lines',
        coordinateSystem: 'geo',
        zlevel: 1,
        effect: {
          show: true,
          period: 5,
          trailLength: 0.5,
          symbol: 'circle',
          symbolSize: 4,
          color: '#00b7ff'
        },
        lineStyle: {
          color: 'rgba(0, 183, 255, 0.3)',
          width: 1,
          curveness: 0.3
        },
        data: links.map(link => {
          const sourceIndex = deviceData.findIndex(item => item.name === link.source);
          const targetIndex = deviceData.findIndex(item => item.name === link.target);
          
          if (sourceIndex < 0 || targetIndex < 0) return null;
          
          return {
            coords: [
              deviceData[sourceIndex].coordinate,
              targetIndex >= 0 ? deviceData[targetIndex].coordinate : center
            ]
          };
        }).filter(item => item !== null)
      },
      {
        name: '连接线底层',
        type: 'lines',
        coordinateSystem: 'geo',
        zlevel: 0,
        lineStyle: {
          color: 'rgba(0, 183, 255, 0.1)',
          width: 3,
          curveness: 0.3
        },
        data: links.map(link => {
          const sourceIndex = deviceData.findIndex(item => item.name === link.source);
          const targetIndex = deviceData.findIndex(item => item.name === link.target);
          
          if (sourceIndex < 0 || targetIndex < 0) return null;
          
          return {
            coords: [
              deviceData[sourceIndex].coordinate,
              targetIndex >= 0 ? deviceData[targetIndex].coordinate : center
            ]
          };
        }).filter(item => item !== null)
      }
    ]
  }
  
  myChart.setOption(option)
  return myChart
}

// 生成连接线
function generateLinks(deviceData) {
  const links = [];
  
  // 为每个点创建到中心的连接
  deviceData.forEach(source => {
    links.push({
      source: source.name,
      target: '数据中心',
      lineStyle: {
        width: Math.random() * 2 + 1,
        opacity: 0.6,
        curveness: 0.3
      }
    });
  });
  
  // 创建一些点之间的随机连接
  const connectedCities = [];
  for (let i = 0; i < 6; i++) {
    const sourceIndex = Math.floor(Math.random() * deviceData.length);
    let targetIndex;
    do {
      targetIndex = Math.floor(Math.random() * deviceData.length);
    } while (targetIndex === sourceIndex);
    
    // 避免重复连接
    const connectionKey = [sourceIndex, targetIndex].sort().join('-');
    if (connectedCities.includes(connectionKey)) {
      continue;
    }
    
    connectedCities.push(connectionKey);
    
    links.push({
      source: deviceData[sourceIndex].name,
      target: deviceData[targetIndex].name,
      lineStyle: {
        width: Math.random() * 2 + 1,
        opacity: 0.6,
        curveness: 0.3
      }
    });
  }
  
  return links;
}

// 初始化设备增长趋势图表
function initDeviceGrowthChart(data) {
  const chartDom = deviceGrowthChart.value
  if (!chartDom) return null
  
  const myChart = echarts.init(chartDom)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['设备总量', '新增设备'],
      textStyle: {
        color: '#fff'
      },
      bottom: 'bottom'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.dates,
      axisLine: {
        lineStyle: {
          color: '#5bd4ff'
        }
      },
      axisLabel: {
        color: '#fff',
        interval: 4
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '设备总量',
        nameTextStyle: {
          color: '#fff'
        },
        axisLine: {
          lineStyle: {
            color: '#5bd4ff'
          }
        },
        axisLabel: {
          color: '#fff'
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(91, 212, 255, 0.2)'
          }
        }
      },
      {
        type: 'value',
        name: '新增设备',
        nameTextStyle: {
          color: '#fff'
        },
        axisLine: {
          lineStyle: {
            color: '#5bd4ff'
          }
        },
        axisLabel: {
          color: '#fff'
        },
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: '设备总量',
        type: 'line',
        smooth: true,
        data: data.deviceGrowthData,
        itemStyle: {
          color: '#409EFF'
        },
        lineStyle: {
          width: 3
        }
      },
      {
        name: '新增设备',
        type: 'bar',
        yAxisIndex: 1,
        data: data.newDeviceData,
        itemStyle: {
          color: '#4ECA8A'
        }
      }
    ]
  }
  
  myChart.setOption(option)
  return myChart
}

// 初始化告警级别分布图表
function initAlertLevelChart(data) {
  const chartDom = alertLevelChart.value
  if (!chartDom) return null
  
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 'bottom',
      textStyle: {
        color: '#fff'
      },
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '告警级别',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#061d33',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  }
  
  myChart.setOption(option)
  return myChart
}

// 初始化设备类型分布图表
function initDeviceTypeChart(data) {
  const chartDom = deviceTypeChart.value
  if (!chartDom) return null
  
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 'bottom',
      textStyle: {
        color: '#fff'
      },
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '设备类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#061d33',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  }
  
  myChart.setOption(option)
  return myChart
}

// 添加随机告警数据
function addRandomAlert() {
  const deviceIds = ['DEV20230001', 'DEV20230002', 'DEV20230003', 'DEV20230004', 'DEV20230005']
  const alertTypes = [
    { content: '离线', level: 'warning' },
    { content: '温度超过阈值', level: 'danger' },
    { content: '连接异常', level: 'warning' },
    { content: '数据异常', level: 'info' },
    { content: '电量低', level: 'warning' }
  ]
  
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const timeStr = `${hours}:${minutes}:${seconds}`
  
  const deviceId = deviceIds[Math.floor(Math.random() * deviceIds.length)]
  const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)]
  
  const newAlert = {
    time: timeStr,
    content: `设备${deviceId}${alertType.content}`,
    level: alertType.level
  }
  
  realtimeAlerts.value.unshift(newAlert)
  
  // 保持最多显示10条告警
  if (realtimeAlerts.value.length > 10) {
    realtimeAlerts.value.pop()
  }
}

// 加载数据大屏概览数据
async function loadDataScreenOverview() {
  try {
    loading.value.overview = true
    const res = await getDataScreenOverview()
    if (res && res.data) {
      deviceTotal.value = res.data.deviceTotal || 0
      onlineDeviceCount.value = res.data.onlineDeviceCount || 0
      alertCount.value = res.data.alertCount || 0
      tenantCount.value = res.data.tenantCount || 0
    }
  } catch (error) {
    console.error('加载数据大屏概览数据失败:', error)
    // 移除重试逻辑
  } finally {
    loading.value.overview = false
  }
}

// 加载设备状态分布数据
async function loadDeviceStatusDistribution() {
  try {
    loading.value.deviceStatus = true
    const res = await getDeviceStatusDistribution()
    if (res && res.data) {
      const myChart = initDeviceStatusChart(res.data)
      updateChartInstance(0, myChart)
    }
  } catch (error) {
    console.error('加载设备状态分布数据失败:', error)
    // 移除重试逻辑
  } finally {
    loading.value.deviceStatus = false
  }
}

// 加载租户类型分布数据
async function loadTenantTypeDistribution() {
  try {
    loading.value.tenantType = true
    const res = await getTenantTypeDistribution()
    if (res && res.data) {
      const myChart = initTenantTypeChart(res.data)
      updateChartInstance(1, myChart)
    }
  } catch (error) {
    console.error('加载租户类型分布数据失败:', error)
    // 移除重试逻辑
  } finally {
    loading.value.tenantType = false
  }
}

// 加载设备地理分布数据
async function loadDeviceGeoDistribution() {
  try {
    loading.value.deviceGeo = true
    const res = await getDeviceGeoDistribution()
    if (res && res.data) {
      const myChart = initMapChart(res.data.devices, res.data.center)
      updateChartInstance(2, myChart)
    }
  } catch (error) {
    console.error('加载设备地理分布数据失败:', error)
    // 移除重试逻辑
  } finally {
    loading.value.deviceGeo = false
  }
}

// 加载设备增长趋势数据
async function loadDeviceGrowthTrend() {
  try {
    loading.value.deviceGrowth = true
    const res = await getDeviceGrowthTrend()
    if (res && res.data) {
      const myChart = initDeviceGrowthChart(res.data)
      updateChartInstance(3, myChart)
    }
  } catch (error) {
    console.error('加载设备增长趋势数据失败:', error)
    // 移除重试逻辑
  } finally {
    loading.value.deviceGrowth = false
  }
}

// 加载告警级别分布数据
async function loadAlertLevelDistribution() {
  try {
    loading.value.alertLevel = true
    const res = await getAlertLevelDistribution()
    if (res && res.data) {
      const myChart = initAlertLevelChart(res.data)
      updateChartInstance(4, myChart)
    }
  } catch (error) {
    console.error('加载告警级别分布数据失败:', error)
    // 移除重试逻辑
  } finally {
    loading.value.alertLevel = false
  }
}

// 加载实时告警数据
async function loadRealtimeAlerts() {
  try {
    loading.value.realtimeAlerts = true
    const res = await getRealtimeAlerts()
    if (res && res.data) {
      realtimeAlerts.value = res.data
    }
  } catch (error) {
    console.error('加载实时告警数据失败:', error)
    // 移除重试逻辑
  } finally {
    loading.value.realtimeAlerts = false
  }
}

// 加载设备类型分布数据
async function loadDeviceTypeDistribution() {
  try {
    loading.value.deviceType = true
    const res = await getDeviceTypeDistribution()
    if (res && res.data) {
      const myChart = initDeviceTypeChart(res.data)
      updateChartInstance(5, myChart)
    }
  } catch (error) {
    console.error('加载设备类型分布数据失败:', error)
    // 移除重试逻辑
  } finally {
    loading.value.deviceType = false
  }
}

// 更新图表实例
function updateChartInstance(index, chart) {
  if (chart) {
    // 如果已有实例，先销毁
    if (chartInstances.value[index]) {
      chartInstances.value[index].dispose()
    }
    chartInstances.value[index] = chart
    
    // 添加防止图表消失的保护措施
    // 确保图表容器有正确的尺寸
    nextTick(() => {
      if (chart && !chart.isDisposed()) {
        chart.resize()
      }
    })
  }
}

// 调整所有图表大小
function resizeAllCharts() {
  chartInstances.value.forEach(chart => {
    if (chart && !chart.isDisposed()) {
      // 添加检查确保容器可见且有尺寸
      const dom = chart.getDom()
      if (dom && dom.offsetHeight > 0 && dom.offsetWidth > 0) {
        chart.resize()
      }
    }
  })
}

// 添加一个函数来检查和恢复丢失的图表
function checkAndRestoreCharts() {
  // 检查设备状态图表
  if (chartInstances.value[0] && chartInstances.value[0].isDisposed()) {
    console.log('检测到设备状态图表已被销毁，尝试重新加载')
    loadDeviceStatusDistribution()
  }
  
  // 检查租户类型图表
  if (chartInstances.value[1] && chartInstances.value[1].isDisposed()) {
    console.log('检测到租户类型图表已被销毁，尝试重新加载')
    loadTenantTypeDistribution()
  }
  
  // 检查地图图表
  if (chartInstances.value[2] && chartInstances.value[2].isDisposed()) {
    console.log('检测到地图图表已被销毁，尝试重新加载')
    loadDeviceGeoDistribution()
  }
  
  // 检查设备增长趋势图表
  if (chartInstances.value[3] && chartInstances.value[3].isDisposed()) {
    console.log('检测到设备增长趋势图表已被销毁，尝试重新加载')
    loadDeviceGrowthTrend()
  }
  
  // 检查告警级别图表
  if (chartInstances.value[4] && chartInstances.value[4].isDisposed()) {
    console.log('检测到告警级别图表已被销毁，尝试重新加载')
    loadAlertLevelDistribution()
  }
  
  // 检查设备类型图表
  if (chartInstances.value[5] && chartInstances.value[5].isDisposed()) {
    console.log('检测到设备类型图表已被销毁，尝试重新加载')
    loadDeviceTypeDistribution()
  }
}

// 处理页面可见性变化的函数
function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    // 页面变为可见时检查图表状态
    nextTick(() => {
      checkAndRestoreCharts()
    })
  }
}

// 添加窗口大小变化后的延迟重绘
let resizeTimeout = null
window.addEventListener('resize', () => {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    checkAndRestoreCharts()
  }, 200)
})

onMounted(() => {
  // 更新时间，只更新一次
  updateTime()
  
  // 初始化图表容器数组
  chartInstances.value = Array(6).fill(null)
  
  // 首次加载数据 - 添加延迟确保DOM已渲染
  nextTick(() => {
    loadAllData()
    
    // 添加一个延迟检查，确保图表正确渲染
    setTimeout(() => {
      checkAndRestoreCharts()
      resizeAllCharts()
    }, 1000)
  })
  
  // 监听窗口大小变化
  window.addEventListener('resize', resizeAllCharts)
  
  // 添加全屏变化事件监听
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('msfullscreenchange', handleFullscreenChange)
  
  // 添加页面可见性监听，当页面从隐藏变为可见时重新加载数据
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

// 在组件卸载时清理资源
onBeforeUnmount(() => {
  // 移除定时器清理代码
  
  // 移除事件监听
  window.removeEventListener('resize', resizeAllCharts)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('msfullscreenchange', handleFullscreenChange)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  
  // 销毁所有图表实例
  chartInstances.value.forEach(chart => {
    if (chart) chart.dispose()
  })
})

// 添加统一加载所有数据的函数
function loadAllData() {
  // 使用Promise.all并行加载所有数据，提高效率
  Promise.all([
    loadDataScreenOverview(),
    loadDeviceStatusDistribution(),
    loadTenantTypeDistribution(),
    loadDeviceGeoDistribution(),
    loadDeviceGrowthTrend(),
    loadAlertLevelDistribution(),
    loadRealtimeAlerts(),
    loadDeviceTypeDistribution()
  ]).catch(error => {
    console.error('加载数据大屏数据失败:', error)
  })
}
</script>

<style scoped>
.data-screen {
  width: 100%;
  height: 100vh;
  background-color: #030c22;
  background-image: 
    radial-gradient(circle at 15% 50%, rgba(5, 56, 107, 0.2) 0%, transparent 40%),
    radial-gradient(circle at 85% 30%, rgba(1, 118, 189, 0.2) 0%, transparent 40%),
    linear-gradient(to bottom, #030c22, #041b36);
  color: #fff;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
  will-change: transform; /* 优化GPU加速 */
}

.screen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  margin-bottom: 20px;
  position: relative;
  z-index: 10;
  padding: 0 10px;
}

/* 全屏模式下的退出按钮 */
.fullscreen-exit-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(6, 42, 75, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  border: 1px solid rgba(91, 212, 255, 0.5);
  box-shadow: 0 0 10px rgba(0, 183, 255, 0.5);
  transition: all 0.3s;
}

.fullscreen-exit-btn:hover {
  background-color: rgba(6, 52, 95, 0.9);
  transform: scale(1.1);
}

.fullscreen-exit-btn i {
  font-size: 20px;
  color: #fff;
}

/* 全屏模式样式增强 */
:fullscreen .data-screen,
:-webkit-full-screen .data-screen,
:-ms-fullscreen .data-screen {
  padding: 30px;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0.8;
  }
  to {
    opacity: 1;
  }
}

:fullscreen .header-title,
:-webkit-full-screen .header-title,
:-ms-fullscreen .header-title {
  font-size: 42px;
}

:fullscreen .chart-container,
:-webkit-full-screen .chart-container,
:-ms-fullscreen .chart-container {
  height: 300px;
  transition: height 0.3s ease;
}

:fullscreen .map-chart,
:-webkit-full-screen .map-chart,
:-ms-fullscreen .map-chart {
  height: 480px;
  transition: height 0.3s ease;
}

:fullscreen .screen-content,
:-webkit-full-screen .screen-content,
:-ms-fullscreen .screen-content {
  height: calc(100% - 80px);
}

:fullscreen .item-value,
:-webkit-full-screen .item-value,
:-ms-fullscreen .item-value {
  font-size: 38px;
}

.data-screen::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, transparent, rgba(0, 183, 255, 0.8), transparent);
  box-shadow: 0 0 15px rgba(0, 183, 255, 0.5);
  animation: scanline 8s linear infinite;
}

@keyframes scanline {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100vh);
  }
}

.header-left {
  width: 220px; /* 与右侧时间显示区域保持平衡 */
}

.header-title {
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(to right, #30cfd0, #07a6f1, #0772e9);
  -webkit-background-clip: text;
  color: transparent;
  text-shadow: 0 0 15px rgba(7, 114, 233, 0.5);
  position: relative;
  animation: pulse 3s ease-in-out infinite;
  display: flex;
  align-items: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}

.title-prefix {
  font-size: 38px;
  font-weight: 900;
  margin-right: 15px;
  color: #00b7ff;
  text-shadow: 0 0 10px rgba(0, 183, 255, 0.8);
}

.title-suffix {
  font-size: 20px;
  margin-left: 15px;
  color: #5bd4ff;
  opacity: 0.8;
}

@keyframes pulse {
  0%, 100% {
    text-shadow: 0 0 15px rgba(7, 114, 233, 0.5);
  }
  50% {
    text-shadow: 0 0 25px rgba(7, 114, 233, 0.8);
  }
}

.header-title::before, .header-title::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 30px;
  height: 2px;
  background: linear-gradient(to right, transparent, #00b7ff);
}

.header-title::before {
  left: -40px;
}

.header-title::after {
  right: -40px;
  transform: rotate(180deg);
}

.header-time {
  font-size: 18px;
  color: #5bd4ff;
  background-color: rgba(6, 42, 75, 0.5);
  padding: 8px 15px;
  border-radius: 20px;
  border: 1px solid rgba(91, 212, 255, 0.3);
  box-shadow: 0 0 10px rgba(0, 183, 255, 0.3);
  display: flex;
  align-items: center;
  min-width: 220px;
  justify-content: flex-end;
}

.header-time i {
  margin-right: 8px;
  font-size: 20px;
  animation: rotate 5s linear infinite;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.screen-content {
  height: calc(100% - 80px);
}

.panel {
  height: 100%;
  background-color: rgba(6, 30, 53, 0.5);
  border: 1px solid rgba(91, 212, 255, 0.2);
  border-radius: 8px;
  padding: 15px;
  box-sizing: border-box;
  box-shadow: 0 0 20px rgba(6, 30, 53, 0.8);
  backdrop-filter: blur(5px);
  position: relative;
  overflow: hidden;
}

.panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, transparent, rgba(0, 183, 255, 0.5), transparent);
}

.panel-item {
  background-color: rgba(6, 42, 75, 0.5);
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 15px;
  box-sizing: border-box;
  border: 1px solid rgba(91, 212, 255, 0.1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.panel-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(0, 183, 255, 0.5), transparent);
}

.panel-header {
  font-size: 18px;
  font-weight: bold;
  color: #5bd4ff;
  margin-bottom: 15px;
  padding-left: 15px;
  border-left: 4px solid #07a6f1;
  display: flex;
  align-items: center;
  position: relative;
  justify-content: space-between;
}

.panel-header i {
  margin-right: 8px;
  font-size: 20px;
}

.panel-header-right {
  display: flex;
  align-items: center;
}

.panel-badge {
  background-color: rgba(6, 52, 95, 0.5);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.badge-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #67C23A;
  margin-right: 5px;
  animation: blink 1.5s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.alert-count {
  background-color: #F56C6C;
  color: #fff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.data-overview {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.overview-item {
  background-color: rgba(6, 42, 75, 0.5);
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  flex: 1;
  margin: 0 5px;
  border: 1px solid rgba(91, 212, 255, 0.2);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.item-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
}

.item-icon i {
  font-size: 24px;
  color: #fff;
}

.device-icon {
  background: linear-gradient(135deg, #36d1dc, #5b86e5);
}

.online-icon {
  background: linear-gradient(135deg, #43cea2, #185a9d);
}

.alert-icon {
  background: linear-gradient(135deg, #ff8008, #ffc837);
}

.tenant-icon {
  background: linear-gradient(135deg, #bc4e9c, #f80759);
}

.item-progress {
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(to right, #30cfd0, #07a6f1);
  border-radius: 2px;
  transition: width 1s ease-in-out;
}

.item-value {
  font-size: 32px;
  font-weight: bold;
  color: #5bd4ff;
  margin-bottom: 5px;
  text-shadow: 0 0 10px rgba(91, 212, 255, 0.5);
}

.item-label {
  font-size: 14px;
  color: #a7e3ff;
  position: relative;
}

.item-label::after {
  content: '';
  position: absolute;
  top: -5px;
  left: 25%;
  right: 25%;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(0, 183, 255, 0.5), transparent);
}

.map-container {
  background-color: rgba(6, 42, 75, 0.5);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid rgba(91, 212, 255, 0.2);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.map-chart {
  height: 350px;
  width: 100%;
}

.realtime-alerts {
  height: 250px;
  overflow-y: auto;
}

.alert-item {
  background-color: rgba(6, 50, 88, 0.5);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
  border-left: 4px solid #909399;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.alert-item:hover {
  transform: translateX(5px);
  background-color: rgba(6, 55, 95, 0.7);
}

.alert-danger {
  border-left-color: #F56C6C;
  box-shadow: 0 0 10px rgba(245, 108, 108, 0.2);
}

.alert-warning {
  border-left-color: #E6A23C;
  box-shadow: 0 0 10px rgba(230, 162, 60, 0.2);
}

.alert-info {
  border-left-color: #909399;
  box-shadow: 0 0 10px rgba(144, 147, 153, 0.2);
}

.alert-time {
  font-size: 12px;
  color: #a7e3ff;
  margin-bottom: 5px;
}

.alert-content {
  font-size: 14px;
  color: #fff;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(6, 42, 75, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(7, 114, 233, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(7, 114, 233, 0.8);
}

/* 适配不同屏幕尺寸 */
@media screen and (max-width: 1440px) {
  .chart-container {
    height: 220px;
  }
  
  .map-chart {
    height: 300px;
  }
  
  .item-value {
    font-size: 28px;
  }
}

@media screen and (max-width: 1200px) {
  .chart-container {
    height: 200px;
  }
  
  .map-chart {
    height: 280px;
  }
  
  .realtime-alerts {
    height: 220px;
  }
}

.chart-container {
  height: 250px;
  width: 100%;
}

.overview-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 183, 255, 0.3);
}

.overview-item::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    to bottom right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(45deg);
  animation: shimmer 4s linear infinite;
}

@keyframes shimmer {
  0% {
    transform: translate(-50%, -50%) rotate(45deg);
  }
  100% {
    transform: translate(150%, 150%) rotate(45deg);
  }
}

.panel-header::before {
  content: '';
  position: absolute;
  left: -4px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, #30cfd0, #07a6f1);
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(7, 166, 241, 0.5);
  }
  50% {
    box-shadow: 0 0 15px rgba(7, 166, 241, 0.8);
  }
}

/* 适配全屏模式 */
@media screen and (min-width: 1920px) {
  .item-value {
    font-size: 36px;
  }
  
  .header-title {
    font-size: 36px;
  }
  
  .chart-container {
    height: 280px;
  }
  
  .map-chart {
    height: 400px;
  }
}

.screen-header::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, #00b7ff, transparent);
}

/* 全屏模式下的边框效果 */
:fullscreen .data-screen::before,
:-webkit-full-screen .data-screen::before,
:-ms-fullscreen .data-screen::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid rgba(7, 166, 241, 0.3);
  pointer-events: none;
  z-index: 1;
  animation: borderPulse 4s infinite;
}

@keyframes borderPulse {
  0%, 100% {
    border-color: rgba(7, 166, 241, 0.3);
    box-shadow: 0 0 10px rgba(7, 166, 241, 0.2);
  }
  50% {
    border-color: rgba(7, 166, 241, 0.6);
    box-shadow: 0 0 20px rgba(7, 166, 241, 0.4);
  }
}
</style>