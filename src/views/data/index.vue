<template>
  <div class="data-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>数据分析</span>
          <div>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :shortcuts="dateShortcuts"
              value-format="YYYY-MM-DD"
            />
            <el-button type="primary" style="margin-left: 10px" @click="refreshData">刷新数据</el-button>
          </div>
        </div>
      </template>

      <!-- 数据概览卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6" v-for="(stat, index) in statsData" :key="index">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon" :style="{ backgroundColor: stat.color }">
                <el-icon><component :is="stat.icon" /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-title">{{ stat.title }}</div>
                <div class="stat-value">{{ stat.value }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表展示区域 -->
      <el-row :gutter="20" class="chart-row">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>设备数据趋势</span>
                <el-select v-model="selectedDevice" placeholder="选择设备" style="width: 200px">
                  <el-option
                    v-for="device in devices"
                    :key="device.id"
                    :label="device.name"
                    :value="device.id"
                  />
                </el-select>
              </div>
            </template>
            <div class="chart-container" ref="lineChartRef"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>设备数据对比</span>
                <el-select
                  v-model="selectedMetric"
                  placeholder="选择指标"
                  style="width: 200px"
                >
                  <el-option label="温度" value="temperature" />
                  <el-option label="湿度" value="humidity" />
                  <el-option label="电量" value="battery" />
                  <el-option label="信号强度" value="signal" />
                </el-select>
              </div>
            </template>
            <div class="chart-container" ref="barChartRef"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="chart-row">
        <el-col :span="24">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>历史数据查询</span>
              </div>
            </template>
            <el-table :data="historyData" style="width: 100%" v-loading="loading" border>
              <el-table-column prop="deviceId" label="设备ID" width="150" />
              <el-table-column prop="deviceName" label="设备名称" width="150" />
              <el-table-column prop="timestamp" label="时间" width="180" />
              <el-table-column prop="temperature" label="温度(°C)" width="120" />
              <el-table-column prop="humidity" label="湿度(%)" width="120" />
              <el-table-column prop="battery" label="电量(%)" width="120" />
              <el-table-column prop="signal" label="信号强度(dBm)" width="120" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag
                    :type="scope.row.status === 'normal' ? 'success' : 'danger'"
                  >
                    {{ scope.row.status === 'normal' ? '正常' : '异常' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
            <div class="pagination-container">
              <el-pagination
                background
                layout="prev, pager, next"
                :total="totalHistory"
                :current-page="currentPage"
                @current-change="handlePageChange"
              />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

// 数据加载状态
const loading = ref(false)

// 日期范围选择
const dateRange = ref([])
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 统计数据
const statsData = ref([
  {
    title: '平均温度',
    value: '24.5°C',
    icon: 'Sunny',
    color: '#f56c6c'
  },
  {
    title: '平均湿度',
    value: '65.2%',
    icon: 'WindPower',
    color: '#409eff'
  },
  {
    title: '平均电量',
    value: '78.3%',
    icon: 'Lightning',
    color: '#67c23a'
  },
  {
    title: '数据点总数',
    value: '5,823',
    icon: 'DataLine',
    color: '#e6a23c'
  }
])

// 设备选择
const devices = ref([
  { id: 'dev001', name: '设备001' },
  { id: 'dev002', name: '设备002' },
  { id: 'dev003', name: '设备003' },
  { id: 'dev004', name: '设备004' },
  { id: 'dev005', name: '设备005' }
])
const selectedDevice = ref('dev001')

// 指标选择
const selectedMetric = ref('temperature')

// 历史数据
const historyData = ref([])
const totalHistory = ref(100)
const currentPage = ref(1)

// 图表引用
const lineChartRef = ref(null)
const barChartRef = ref(null)
let lineChart = null
let barChart = null

// 模拟生成历史数据
const generateHistoryData = (page = 1, pageSize = 10) => {
  const result = []
  const baseIndex = (page - 1) * pageSize
  
  for (let i = 0; i < pageSize; i++) {
    const index = baseIndex + i
    const timestamp = new Date()
    timestamp.setHours(timestamp.getHours() - index)
    
    result.push({
      deviceId: `DEV${String(index % 5 + 1).padStart(3, '0')}`,
      deviceName: `设备${index % 5 + 1}`,
      timestamp: timestamp.toLocaleString(),
      temperature: (20 + Math.random() * 10).toFixed(1),
      humidity: (50 + Math.random() * 30).toFixed(1),
      battery: (60 + Math.random() * 40).toFixed(1),
      signal: (-100 + Math.random() * 60).toFixed(1),
      status: Math.random() > 0.8 ? 'abnormal' : 'normal'
    })
  }
  
  return result
}

// 刷新数据
const refreshData = () => {
  loading.value = true
  
  // 模拟API请求延迟
  setTimeout(() => {
    // 更新历史数据
    historyData.value = generateHistoryData(currentPage.value)
    
    // 更新图表
    initLineChart()
    initBarChart()
    
    loading.value = false
  }, 500)
}

// 页码变化处理
const handlePageChange = (page) => {
  currentPage.value = page
  refreshData()
}

// 初始化折线图
const initLineChart = () => {
  if (!lineChartRef.value) return
  
  if (!lineChart) {
    lineChart = echarts.init(lineChartRef.value)
  }
  
  // 生成模拟数据
  const times = []
  const tempData = []
  const humidityData = []
  
  for (let i = 0; i < 24; i++) {
    const hour = 23 - i
    times.unshift(`${hour}:00`)
    tempData.unshift((20 + Math.random() * 10).toFixed(1))
    humidityData.unshift((50 + Math.random() * 30).toFixed(1))
  }
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['温度', '湿度']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times
    },
    yAxis: [
      {
        type: 'value',
        name: '温度(°C)',
        position: 'left'
      },
      {
        type: 'value',
        name: '湿度(%)',
        position: 'right'
      }
    ],
    series: [
      {
        name: '温度',
        type: 'line',
        yAxisIndex: 0,
        data: tempData,
        smooth: true
      },
      {
        name: '湿度',
        type: 'line',
        yAxisIndex: 1,
        data: humidityData,
        smooth: true
      }
    ]
  }
  
  lineChart.setOption(option)
}

// 初始化柱状图
const initBarChart = () => {
  if (!barChartRef.value) return
  
  if (!barChart) {
    barChart = echarts.init(barChartRef.value)
  }
  
  // 生成模拟数据
  const deviceNames = devices.value.map(device => device.name)
  const dataValues = devices.value.map(() => (50 + Math.random() * 50).toFixed(1))
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: deviceNames
    },
    yAxis: {
      type: 'value',
      name: getMetricUnit()
    },
    series: [
      {
        name: getMetricName(),
        type: 'bar',
        data: dataValues,
        itemStyle: {
          color: function(params) {
            const colorList = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399']
            return colorList[params.dataIndex % colorList.length]
          }
        }
      }
    ]
  }
  
  barChart.setOption(option)
}

// 获取指标名称
const getMetricName = () => {
  switch (selectedMetric.value) {
    case 'temperature': return '温度'
    case 'humidity': return '湿度'
    case 'battery': return '电量'
    case 'signal': return '信号强度'
    default: return '温度'
  }
}

// 获取指标单位
const getMetricUnit = () => {
  switch (selectedMetric.value) {
    case 'temperature': return '温度(°C)'
    case 'humidity': return '湿度(%)'
    case 'battery': return '电量(%)'
    case 'signal': return '信号强度(dBm)'
    default: return '温度(°C)'
  }
}

// 窗口大小变化处理
const handleResize = () => {
  if (lineChart) lineChart.resize()
  if (barChart) barChart.resize()
}

onMounted(() => {
  // 初始化日期范围为最近一周
  const end = new Date()
  const start = new Date()
  start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
  dateRange.value = [start.toISOString().split('T')[0], end.toISOString().split('T')[0]]
  
  // 加载初始数据
  refreshData()
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 移除窗口大小变化监听
  window.removeEventListener('resize', handleResize)
  
  // 释放图表实例
  if (lineChart) {
    lineChart.dispose()
    lineChart = null
  }
  if (barChart) {
    barChart.dispose()
    barChart = null
  }
})
</script>

<style scoped>
.data-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-info {
  margin-left: 15px;
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 350px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 