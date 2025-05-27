<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6" v-for="(item, index) in statCards" :key="index">
        <el-card class="stat-card" :body-style="{ padding: '20px' }">
          <div class="card-content">
            <el-icon :size="36" :class="item.iconClass">
              <component :is="item.icon"></component>
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-title">{{ item.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>设备连接趋势</span>
            </div>
          </template>
          <div class="chart-container" ref="lineChartRef"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>设备状态分布</span>
            </div>
          </template>
          <div class="chart-container" ref="pieChartRef"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useDeviceStore } from '../../stores/device'
import * as echarts from 'echarts'

const deviceStore = useDeviceStore()

// 统计卡片数据
const statCards = ref([
  {
    title: '设备总数',
    value: 0,
    icon: 'Monitor',
    iconClass: 'total-icon'
  },
  {
    title: '在线设备',
    value: 0,
    icon: 'SuccessFilled',
    iconClass: 'online-icon'
  },
  {
    title: '离线设备',
    value: 0,
    icon: 'CircleCloseFilled',
    iconClass: 'offline-icon'
  },
  {
    title: '告警设备',
    value: 0,
    icon: 'WarningFilled',
    iconClass: 'alarm-icon'
  }
])

// 图表引用
const lineChartRef = ref(null)
const pieChartRef = ref(null)
let lineChart = null
let pieChart = null

// 假数据模拟
const mockData = () => {
  // 模拟设备统计数据
  const stats = {
    total: 120,
    online: 86,
    offline: 24,
    alarm: 10
  }
  deviceStore.setDeviceStats(stats)
  
  // 更新统计卡片
  statCards.value[0].value = stats.total
  statCards.value[1].value = stats.online
  statCards.value[2].value = stats.offline
  statCards.value[3].value = stats.alarm
}

// 初始化折线图
const initLineChart = () => {
  if (!lineChartRef.value) return
  
  lineChart = echarts.init(lineChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['在线设备', '告警次数']
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
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '在线设备',
        type: 'line',
        data: [80, 82, 85, 86, 88, 90, 86],
        smooth: true
      },
      {
        name: '告警次数',
        type: 'line',
        data: [2, 5, 3, 8, 6, 4, 10],
        smooth: true
      }
    ]
  }
  
  lineChart.setOption(option)
}

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return
  
  pieChart = echarts.init(pieChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: ['在线设备', '离线设备', '告警设备']
    },
    series: [
      {
        name: '设备状态',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 86, name: '在线设备' },
          { value: 24, name: '离线设备' },
          { value: 10, name: '告警设备' }
        ]
      }
    ]
  }
  
  pieChart.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  if (lineChart) lineChart.resize()
  if (pieChart) pieChart.resize()
}

onMounted(() => {
  // 模拟数据
  mockData()
  
  // 初始化图表
  initLineChart()
  initPieChart()
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize)
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.stat-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-content {
  display: flex;
  align-items: center;
}

.stat-info {
  margin-left: 20px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-title {
  font-size: 14px;
  color: #909399;
}

.total-icon {
  color: #409EFF;
}

.online-icon {
  color: #67C23A;
}

.offline-icon {
  color: #909399;
}

.alarm-icon {
  color: #F56C6C;
}

.chart-row {
  margin-top: 20px;
}

.chart-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 350px;
}
</style> 