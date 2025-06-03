<template>
  <div class="alert-statistics">
    <div class="statistics-header">
      <div class="filter-container">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="dateShortcuts"
          style="width: 350px; margin-right: 15px;"
        />
        <el-select v-model="selectedLevel" placeholder="告警级别" style="width: 150px; margin-right: 15px;">
          <el-option label="全部级别" value="" />
          <el-option label="紧急" value="critical" />
          <el-option label="重要" value="major" />
          <el-option label="次要" value="minor" />
          <el-option label="提示" value="warning" />
        </el-select>
        <el-button type="primary" @click="refreshData">查询</el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>
      <div>
        <el-button type="primary" plain @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>
    
    <!-- 数据卡片 -->
    <div class="data-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="data-card-item">
              <div class="data-card-value">{{ totalAlerts }}</div>
              <div class="data-card-title">告警总数</div>
              <div class="data-card-trend" :class="{ 'up': alertGrowthRate > 0, 'down': alertGrowthRate < 0 }">
                <el-icon v-if="alertGrowthRate > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="alertGrowthRate < 0"><ArrowDown /></el-icon>
                <span>{{ Math.abs(alertGrowthRate) }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="data-card-item">
              <div class="data-card-value">{{ activeAlerts }}</div>
              <div class="data-card-title">活跃告警</div>
              <div class="data-card-trend" :class="{ 'up': activeAlertRate > 0, 'down': activeAlertRate < 0 }">
                <el-icon v-if="activeAlertRate > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="activeAlertRate < 0"><ArrowDown /></el-icon>
                <span>{{ Math.abs(activeAlertRate) }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="data-card-item">
              <div class="data-card-value">{{ handledAlerts }}</div>
              <div class="data-card-title">已处理告警</div>
              <div class="data-card-trend up">
                <span>{{ handledRate }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="data-card-item">
              <div class="data-card-value">{{ avgHandleTime }}</div>
              <div class="data-card-title">平均处理时长</div>
              <div class="data-card-trend" :class="{ 'up': handleTimeRate > 0, 'down': handleTimeRate < 0 }">
                <el-icon v-if="handleTimeRate > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="handleTimeRate < 0"><ArrowDown /></el-icon>
                <span>{{ Math.abs(handleTimeRate) }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 图表区域 -->
    <div class="chart-container">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <span>告警级别分布</span>
              </div>
            </template>
            <div ref="alertLevelChartRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <span>告警类型分布</span>
              </div>
            </template>
            <div ref="alertTypeChartRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <span>告警趋势分析</span>
              </div>
            </template>
            <div ref="alertTrendChartRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <span>租户告警分布</span>
              </div>
            </template>
            <div ref="tenantAlertChartRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 数据表格 -->
    <el-card shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="table-header">
          <span>告警统计详情</span>
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索告警名称/设备" 
            style="width: 250px;"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
      </template>
      <div class="table-responsive">
        <el-table 
          :data="alertTableData" 
          border 
          stripe 
          style="width: 100%"
          :header-cell-style="{background:'#f5f7fa',color:'#606266'}"
          :row-class-name="tableRowClassName"
          height="500"
        >
          <el-table-column prop="id" label="告警ID" width="120" />
          <el-table-column prop="name" label="告警名称" min-width="150" show-overflow-tooltip />
          <el-table-column prop="level" label="告警级别" width="100">
            <template #default="scope">
              <el-tag :type="getAlertLevelTag(scope.row.level)">
                {{ getAlertLevelText(scope.row.level) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="告警类型" min-width="120" show-overflow-tooltip />
          <el-table-column prop="deviceName" label="设备名称" min-width="150" show-overflow-tooltip />
          <el-table-column prop="tenantName" label="所属租户" min-width="150" show-overflow-tooltip />
          <el-table-column prop="occurTime" label="发生时间" min-width="180" sortable show-overflow-tooltip />
          <el-table-column prop="handleTime" label="处理时间" min-width="180" sortable show-overflow-tooltip />
          <el-table-column prop="duration" label="持续时长" min-width="100" sortable show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100" fixed="right">
            <template #default="scope">
              <el-tag :type="getStatusTag(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

// 日期过滤
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

// 告警级别筛选
const selectedLevel = ref('')

// 搜索关键词
const searchKeyword = ref('')

// 数据卡片统计
const totalAlerts = ref(3685)
const activeAlerts = ref(365)
const handledAlerts = ref(3320)
const avgHandleTime = ref('3.5小时')
const alertGrowthRate = ref(4.2)
const activeAlertRate = ref(-8.5)
const handledRate = ref(90.1)
const handleTimeRate = ref(-12.5)

// 图表引用
const alertLevelChartRef = ref(null)
const alertTypeChartRef = ref(null)
const alertTrendChartRef = ref(null)
const tenantAlertChartRef = ref(null)

// 表格数据
const alertTableData = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 清理函数
const cleanupFunctions = []

// 表格行样式
const tableRowClassName = ({ row, rowIndex }) => {
  return rowIndex % 2 === 0 ? 'even-row' : 'odd-row'
}

// 获取告警级别标签
const getAlertLevelTag = (level) => {
  const levelMap = {
    'critical': 'danger',
    'major': 'warning',
    'minor': 'success',
    'warning': 'info'
  }
  return levelMap[level] || 'info'
}

// 获取告警级别文本
const getAlertLevelText = (level) => {
  const levelMap = {
    'critical': '紧急',
    'major': '重要',
    'minor': '次要',
    'warning': '提示'
  }
  return levelMap[level] || '未知'
}

// 获取状态标签
const getStatusTag = (status) => {
  const statusMap = {
    'active': 'danger',
    'handled': 'success',
    'pending': 'warning',
    'ignored': 'info'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'active': '活跃',
    'handled': '已处理',
    'pending': '待处理',
    'ignored': '已忽略'
  }
  return statusMap[status] || '未知'
}

// 初始化告警级别分布图表
const initAlertLevelChart = () => {
  const chartDom = alertLevelChartRef.value
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 'bottom',
      data: ['紧急', '重要', '次要', '提示']
    },
    series: [
      {
        name: '告警级别',
        type: 'pie',
        radius: ['40%', '70%'],
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
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 245, name: '紧急', itemStyle: { color: '#F56C6C' } },
          { value: 780, name: '重要', itemStyle: { color: '#E6A23C' } },
          { value: 1850, name: '次要', itemStyle: { color: '#67C23A' } },
          { value: 810, name: '提示', itemStyle: { color: '#909399' } }
        ]
      }
    ]
  }
  myChart.setOption(option)
  
  // 监听窗口大小变化
  const resizeHandler = () => {
    myChart && myChart.resize()
  }
  window.addEventListener('resize', resizeHandler)
  
  // 监听元素显示状态
  const observer = new ResizeObserver(() => {
    myChart && myChart.resize()
  })
  observer.observe(chartDom)
  
  // 返回清理函数
  return () => {
    window.removeEventListener('resize', resizeHandler)
    observer.disconnect()
    myChart.dispose()
  }
}

// 初始化告警类型分布图表
const initAlertTypeChart = () => {
  const chartDom = alertTypeChartRef.value
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 'bottom',
      data: ['设备离线', '设备故障', '环境异常', '安全警报', '性能告警', '其他']
    },
    series: [
      {
        name: '告警类型',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 850, name: '设备离线' },
          { value: 650, name: '设备故障' },
          { value: 780, name: '环境异常' },
          { value: 520, name: '安全警报' },
          { value: 580, name: '性能告警' },
          { value: 305, name: '其他' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  myChart.setOption(option)
  
  // 监听窗口大小变化
  const resizeHandler = () => {
    myChart && myChart.resize()
  }
  window.addEventListener('resize', resizeHandler)
  
  // 监听元素显示状态
  const observer = new ResizeObserver(() => {
    myChart && myChart.resize()
  })
  observer.observe(chartDom)
  
  // 返回清理函数
  return () => {
    window.removeEventListener('resize', resizeHandler)
    observer.disconnect()
    myChart.dispose()
  }
}

// 初始化告警趋势分析图表
const initAlertTrendChart = () => {
  const chartDom = alertTrendChartRef.value
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['告警总数', '紧急告警', '重要告警', '次要告警', '提示告警'],
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
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '告警总数',
        type: 'line',
        stack: 'Total',
        emphasis: {
          focus: 'series'
        },
        data: [280, 320, 350, 390, 320, 280, 310, 330, 325, 350, 365, 365]
      },
      {
        name: '紧急告警',
        type: 'line',
        stack: 'Level',
        emphasis: {
          focus: 'series'
        },
        data: [20, 25, 30, 35, 25, 18, 22, 26, 20, 18, 15, 11]
      },
      {
        name: '重要告警',
        type: 'line',
        stack: 'Level',
        emphasis: {
          focus: 'series'
        },
        data: [60, 70, 80, 95, 75, 65, 70, 75, 72, 85, 75, 58]
      },
      {
        name: '次要告警',
        type: 'line',
        stack: 'Level',
        emphasis: {
          focus: 'series'
        },
        data: [140, 160, 170, 185, 155, 140, 155, 165, 160, 175, 195, 200]
      },
      {
        name: '提示告警',
        type: 'line',
        stack: 'Level',
        emphasis: {
          focus: 'series'
        },
        data: [60, 65, 70, 75, 65, 57, 63, 64, 73, 72, 80, 96]
      }
    ]
  }
  myChart.setOption(option)
  
  // 监听窗口大小变化
  const resizeHandler = () => {
    myChart && myChart.resize()
  }
  window.addEventListener('resize', resizeHandler)
  
  // 监听元素显示状态
  const observer = new ResizeObserver(() => {
    myChart && myChart.resize()
  })
  observer.observe(chartDom)
  
  // 返回清理函数
  return () => {
    window.removeEventListener('resize', resizeHandler)
    observer.disconnect()
    myChart.dispose()
  }
}

// 初始化租户告警分布图表
const initTenantAlertChart = () => {
  const chartDom = tenantAlertChartRef.value
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['告警数量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: ['其他租户', '北京大学', '南京小区', '上海驿站', '深圳中学', '广州实验小学', '杭州花园', '武汉科技大学']
    },
    series: [
      {
        name: '告警数量',
        type: 'bar',
        data: [120, 280, 190, 210, 350, 410, 280, 425]
      }
    ]
  }
  myChart.setOption(option)
  
  // 监听窗口大小变化
  const resizeHandler = () => {
    myChart && myChart.resize()
  }
  window.addEventListener('resize', resizeHandler)
  
  // 监听元素显示状态
  const observer = new ResizeObserver(() => {
    myChart && myChart.resize()
  })
  observer.observe(chartDom)
  
  // 返回清理函数
  return () => {
    window.removeEventListener('resize', resizeHandler)
    observer.disconnect()
    myChart.dispose()
  }
}

// 获取告警表格数据
const getAlertTableData = () => {
  // 模拟后端API请求
  setTimeout(() => {
    // 生成模拟数据
    const mockData = [
      {
        id: 'ALT20230001',
        name: '设备离线告警',
        level: 'critical',
        type: '设备离线',
        deviceName: '智能黑板A',
        tenantName: '第一实验小学',
        occurTime: '2023-06-18 10:30:00',
        handleTime: '2023-06-18 11:15:28',
        duration: '45分钟',
        status: 'handled'
      },
      {
        id: 'ALT20230002',
        name: '温度超限告警',
        level: 'major',
        type: '环境异常',
        deviceName: '空气质量检测仪',
        tenantName: '阳光小区',
        occurTime: '2023-06-18 14:20:00',
        handleTime: '2023-06-18 16:30:45',
        duration: '2小时10分钟',
        status: 'handled'
      },
      {
        id: 'ALT20230003',
        name: '异常访问告警',
        level: 'major',
        type: '安全警报',
        deviceName: '门禁系统',
        tenantName: '阳光小区',
        occurTime: '2023-06-19 09:15:00',
        handleTime: '2023-06-19 09:25:12',
        duration: '10分钟',
        status: 'handled'
      },
      {
        id: 'ALT20230004',
        name: '内存使用率过高',
        level: 'minor',
        type: '性能告警',
        deviceName: '智能讲台',
        tenantName: '第二中学',
        occurTime: '2023-06-19 11:40:00',
        handleTime: '2023-06-19 14:15:30',
        duration: '2小时35分钟',
        status: 'handled'
      },
      {
        id: 'ALT20230005',
        name: '设备故障告警',
        level: 'critical',
        type: '设备故障',
        deviceName: '分拣机器人',
        tenantName: '中心驿站',
        occurTime: '2023-06-19 16:25:00',
        handleTime: null,
        duration: '持续中',
        status: 'handling'
      },
      {
        id: 'ALT20230006',
        name: '电池电量低告警',
        level: 'warning',
        type: '性能告警',
        deviceName: '温湿度监测器',
        tenantName: '第一实验小学',
        occurTime: '2023-06-20 09:45:00',
        handleTime: null,
        duration: '持续中',
        status: 'active'
      },
      {
        id: 'ALT20230007',
        name: '网络连接不稳定',
        level: 'minor',
        type: '性能告警',
        deviceName: '智能电表',
        tenantName: '阳光小区',
        occurTime: '2023-06-20 10:15:00',
        handleTime: '2023-06-20 11:20:40',
        duration: '1小时5分钟',
        status: 'handled'
      },
      {
        id: 'ALT20230008',
        name: '摄像头画面异常',
        level: 'major',
        type: '设备故障',
        deviceName: '监控摄像头B',
        tenantName: '第一实验小学',
        occurTime: '2023-06-20 11:30:00',
        handleTime: null,
        duration: '持续中',
        status: 'active'
      },
      {
        id: 'ALT20230009',
        name: '湿度超限告警',
        level: 'minor',
        type: '环境异常',
        deviceName: '温湿度监测器',
        tenantName: '第一实验小学',
        occurTime: '2023-06-20 13:20:00',
        handleTime: '2023-06-20 15:10:33',
        duration: '1小时50分钟',
        status: 'handled'
      },
      {
        id: 'ALT20230010',
        name: '固件版本过低',
        level: 'warning',
        type: '其他',
        deviceName: '智能水表',
        tenantName: '阳光小区',
        occurTime: '2023-06-20 14:50:00',
        handleTime: null,
        duration: '持续中',
        status: 'ignored'
      }
    ]
    
    // 过滤数据
    let filteredData = [...mockData]
    
    // 根据告警级别筛选
    if (selectedLevel.value) {
      filteredData = filteredData.filter(item => item.level === selectedLevel.value)
    }
    
    // 根据搜索关键词筛选
    if (searchKeyword.value) {
      filteredData = filteredData.filter(item => 
        item.name.includes(searchKeyword.value) || 
        item.deviceName.includes(searchKeyword.value)
      )
    }
    
    // 分页处理
    total.value = filteredData.length
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    alertTableData.value = filteredData.slice(start, end)
  }, 300)
}

// 刷新数据
const refreshData = () => {
  getAlertTableData()
  ElMessage.success('数据已刷新')
}

// 重置筛选条件
const resetFilters = () => {
  dateRange.value = []
  selectedLevel.value = ''
  searchKeyword.value = ''
  currentPage.value = 1
  getAlertTableData()
}

// 导出数据
const exportData = () => {
  ElMessage.success('数据导出中，请稍候...')
  setTimeout(() => {
    ElMessage.success('数据导出成功')
  }, 1500)
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getAlertTableData()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getAlertTableData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getAlertTableData()
}

onMounted(() => {
  // 初始化图表
  const cleanupFunctions = [
    initAlertLevelChart(),
    initAlertTypeChart(),
    initAlertTrendChart(),
    initTenantAlertChart()
  ]
  
  // 获取表格数据
  getAlertTableData()
})

onBeforeUnmount(() => {
  // 清理所有图表
  cleanupFunctions.forEach(cleanup => cleanup())
})
</script>

<style scoped>
.alert-statistics {
  width: 100%;
}

.statistics-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.data-cards {
  margin-bottom: 20px;
}

.data-card-item {
  text-align: center;
  position: relative;
  padding: 20px 0;
}

.data-card-value {
  font-size: 32px;
  font-weight: bold;
  color: #409EFF;
}

.data-card-title {
  margin-top: 10px;
  color: #606266;
}

.data-card-trend {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.data-card-trend.up {
  color: #67C23A;
}

.data-card-trend.down {
  color: #F56C6C;
}

.chart-container {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
  margin-bottom: 20px;
}

.chart {
  height: 320px;
  width: 100%;
}

.chart-header, .table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 20px;
}

:deep(.even-row) {
  background-color: #f9fafc;
}

:deep(.odd-row) {
  background-color: #ffffff;
}

:deep(.el-table__body tr:hover > td) {
  background-color: #ecf5ff !important;
}

@media screen and (max-width: 768px) {
  .statistics-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-container {
    margin-bottom: 15px;
    width: 100%;
  }
  
  .chart-card {
    height: 350px;
  }
  
  .chart {
    height: 270px;
  }
}
</style> 