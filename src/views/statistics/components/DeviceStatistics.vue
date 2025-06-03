<template>
  <div class="device-statistics">
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
        <el-select v-model="selectedCategory" placeholder="设备类型" style="width: 150px; margin-right: 15px;">
          <el-option label="全部类型" value="" />
          <el-option label="教学设备" value="教学设备" />
          <el-option label="安防设备" value="安防设备" />
          <el-option label="环境检测" value="环境检测" />
          <el-option label="能源管理" value="能源管理" />
          <el-option label="其他设备" value="其他设备" />
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
              <div class="data-card-value">{{ totalDevices }}</div>
              <div class="data-card-title">设备总数</div>
              <div class="data-card-trend" :class="{ 'up': deviceGrowthRate > 0, 'down': deviceGrowthRate < 0 }">
                <el-icon v-if="deviceGrowthRate > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="deviceGrowthRate < 0"><ArrowDown /></el-icon>
                <span>{{ Math.abs(deviceGrowthRate) }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="data-card-item">
              <div class="data-card-value">{{ onlineDevices }}</div>
              <div class="data-card-title">在线设备</div>
              <div class="data-card-trend up">
                <span>{{ onlineRate }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="data-card-item">
              <div class="data-card-value">{{ newDevices }}</div>
              <div class="data-card-title">本月新增</div>
              <div class="data-card-trend" :class="{ 'up': newDeviceGrowthRate > 0, 'down': newDeviceGrowthRate < 0 }">
                <el-icon v-if="newDeviceGrowthRate > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="newDeviceGrowthRate < 0"><ArrowDown /></el-icon>
                <span>{{ Math.abs(newDeviceGrowthRate) }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="data-card-item">
              <div class="data-card-value">{{ activeDevices }}</div>
              <div class="data-card-title">活跃设备</div>
              <div class="data-card-trend up">
                <span>{{ activeRate }}%</span>
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
                <span>设备类型分布</span>
              </div>
            </template>
            <div ref="deviceTypeChartRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <span>设备状态分布</span>
              </div>
            </template>
            <div ref="deviceStatusChartRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <span>设备增长趋势</span>
              </div>
            </template>
            <div ref="deviceGrowthChartRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <span>租户设备分布</span>
              </div>
            </template>
            <div ref="tenantDeviceChartRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 数据表格 -->
    <el-card shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="table-header">
          <span>设备统计详情</span>
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索设备名称/ID" 
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
          :data="deviceTableData" 
          border 
          stripe 
          style="width: 100%"
          :header-cell-style="{background:'#f5f7fa',color:'#606266'}"
          :row-class-name="tableRowClassName"
          height="500"
        >
          <el-table-column prop="id" label="设备ID" width="120" />
          <el-table-column prop="name" label="设备名称" min-width="150" show-overflow-tooltip />
          <el-table-column prop="category" label="设备类型" width="120">
            <template #default="scope">
              <el-tag :type="getDeviceCategoryTag(scope.row.category)">
                {{ scope.row.category }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="tenantName" label="所属租户" min-width="150" show-overflow-tooltip />
          <el-table-column prop="tenantType" label="租户类型" width="100">
            <template #default="scope">
              <el-tag :type="getTenantTypeTag(scope.row.tenantType)" size="small">
                {{ scope.row.tenantType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="location" label="安装位置" min-width="150" show-overflow-tooltip />
          <el-table-column prop="activationTime" label="激活时间" min-width="180" sortable show-overflow-tooltip />
          <el-table-column prop="lastOnlineTime" label="最近在线" min-width="180" sortable show-overflow-tooltip />
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

// 设备类型筛选
const selectedCategory = ref('')

// 搜索关键词
const searchKeyword = ref('')

// 数据卡片统计
const totalDevices = ref(5283)
const onlineDevices = ref(4752)
const newDevices = ref(183)
const activeDevices = ref(3950)
const deviceGrowthRate = ref(12.8)
const newDeviceGrowthRate = ref(-5.2)
const onlineRate = ref(89.9)
const activeRate = ref(74.8)

// 图表引用
const deviceTypeChartRef = ref(null)
const deviceStatusChartRef = ref(null)
const deviceGrowthChartRef = ref(null)
const tenantDeviceChartRef = ref(null)

// 表格数据
const deviceTableData = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 清理函数
const cleanupFunctions = []

// 表格行样式
const tableRowClassName = ({ row, rowIndex }) => {
  return rowIndex % 2 === 0 ? 'even-row' : 'odd-row'
}

// 获取设备类型标签
const getDeviceCategoryTag = (category) => {
  const categoryMap = {
    '教学设备': 'success',
    '安防设备': 'warning',
    '环境检测': 'info',
    '能源管理': 'primary',
    '其他设备': 'danger'
  }
  return categoryMap[category] || 'info'
}

// 获取租户类型标签
const getTenantTypeTag = (type) => {
  const typeMap = {
    '学校': 'success',
    '小区': 'primary',
    '驿站': 'warning'
  }
  return typeMap[type] || 'info'
}

// 获取状态标签
const getStatusTag = (status) => {
  const statusMap = {
    'online': 'success',
    'offline': 'info',
    'fault': 'danger',
    'maintenance': 'warning'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'online': '在线',
    'offline': '离线',
    'fault': '故障',
    'maintenance': '维护中'
  }
  return statusMap[status] || '未知'
}

// 初始化设备类型分布图表
const initDeviceTypeChart = () => {
  const chartDom = deviceTypeChartRef.value
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
      data: ['教学设备', '安防设备', '环境检测', '能源管理', '其他设备']
    },
    series: [
      {
        name: '设备类型',
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
          { value: 1850, name: '教学设备' },
          { value: 1200, name: '安防设备' },
          { value: 950, name: '环境检测' },
          { value: 780, name: '能源管理' },
          { value: 503, name: '其他设备' }
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

// 初始化设备状态分布图表
const initDeviceStatusChart = () => {
  const chartDom = deviceStatusChartRef.value
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
      data: ['在线', '离线', '故障', '维护中']
    },
    series: [
      {
        name: '设备状态',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 4752, name: '在线', itemStyle: { color: '#67C23A' } },
          { value: 320, name: '离线', itemStyle: { color: '#909399' } },
          { value: 145, name: '故障', itemStyle: { color: '#F56C6C' } },
          { value: 66, name: '维护中', itemStyle: { color: '#E6A23C' } }
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

// 初始化设备增长趋势图表
const initDeviceGrowthChart = () => {
  const chartDom = deviceGrowthChartRef.value
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
      data: ['设备总量', '新增设备', '活跃设备'],
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
        name: '设备总量',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: [4200, 4350, 4500, 4650, 4750, 4850, 4950, 5050, 5150, 5200, 5250, 5283]
      },
      {
        name: '新增设备',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: [120, 150, 150, 150, 100, 100, 100, 100, 100, 50, 50, 33]
      },
      {
        name: '活跃设备',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: [3200, 3300, 3400, 3500, 3550, 3600, 3650, 3700, 3800, 3850, 3900, 3950]
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

// 初始化租户设备分布图表
const initTenantDeviceChart = () => {
  const chartDom = tenantDeviceChartRef.value
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
      data: ['设备数量']
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
        name: '设备数量',
        type: 'bar',
        data: [350, 560, 380, 420, 790, 920, 640, 980]
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

// 获取设备表格数据
const getDeviceTableData = () => {
  // 模拟后端API请求
  setTimeout(() => {
    // 生成模拟数据
    const mockData = [
      {
        id: 'DEV20230001',
        name: '智能黑板A',
        category: '教学设备',
        tenantName: '第一实验小学',
        tenantType: '学校',
        location: '教学楼101',
        activationTime: '2023-03-15 10:30:00',
        lastOnlineTime: '2023-06-20 08:45:12',
        status: 'online'
      },
      {
        id: 'DEV20230002',
        name: '监控摄像头B',
        category: '安防设备',
        tenantName: '第一实验小学',
        tenantType: '学校',
        location: '操场东侧',
        activationTime: '2023-03-16 14:20:00',
        lastOnlineTime: '2023-06-20 09:12:35',
        status: 'online'
      },
      {
        id: 'DEV20230003',
        name: '空气质量检测仪',
        category: '环境检测',
        tenantName: '阳光小区',
        tenantType: '小区',
        location: '小区中心花园',
        activationTime: '2023-03-20 09:15:00',
        lastOnlineTime: '2023-06-20 08:30:45',
        status: 'online'
      },
      {
        id: 'DEV20230004',
        name: '智能电表',
        category: '能源管理',
        tenantName: '阳光小区',
        tenantType: '小区',
        location: '1号楼配电室',
        activationTime: '2023-03-25 11:40:00',
        lastOnlineTime: '2023-06-19 22:15:30',
        status: 'online'
      },
      {
        id: 'DEV20230005',
        name: '包裹柜',
        category: '其他设备',
        tenantName: '中心驿站',
        tenantType: '驿站',
        location: '驿站前厅',
        activationTime: '2023-04-01 16:25:00',
        lastOnlineTime: '2023-06-18 18:40:22',
        status: 'offline'
      },
      {
        id: 'DEV20230006',
        name: '智能讲台',
        category: '教学设备',
        tenantName: '第二中学',
        tenantType: '学校',
        location: '教学楼205',
        activationTime: '2023-04-05 09:45:00',
        lastOnlineTime: '2023-06-20 10:05:18',
        status: 'online'
      },
      {
        id: 'DEV20230007',
        name: '门禁系统',
        category: '安防设备',
        tenantName: '阳光小区',
        tenantType: '小区',
        location: '小区南门',
        activationTime: '2023-04-10 10:15:00',
        lastOnlineTime: '2023-06-20 09:55:40',
        status: 'online'
      },
      {
        id: 'DEV20230008',
        name: '温湿度监测器',
        category: '环境检测',
        tenantName: '第一实验小学',
        tenantType: '学校',
        location: '图书馆',
        activationTime: '2023-04-15 14:30:00',
        lastOnlineTime: '2023-06-15 08:20:15',
        status: 'fault'
      },
      {
        id: 'DEV20230009',
        name: '智能水表',
        category: '能源管理',
        tenantName: '阳光小区',
        tenantType: '小区',
        location: '2号楼水表间',
        activationTime: '2023-04-20 11:20:00',
        lastOnlineTime: '2023-06-20 07:30:10',
        status: 'online'
      },
      {
        id: 'DEV20230010',
        name: '分拣机器人',
        category: '其他设备',
        tenantName: '中心驿站',
        tenantType: '驿站',
        location: '分拣区',
        activationTime: '2023-04-25 09:50:00',
        lastOnlineTime: '2023-06-19 16:45:33',
        status: 'maintenance'
      }
    ]
    
    // 过滤数据
    let filteredData = [...mockData]
    
    // 根据设备类型筛选
    if (selectedCategory.value) {
      filteredData = filteredData.filter(item => item.category === selectedCategory.value)
    }
    
    // 根据搜索关键词筛选
    if (searchKeyword.value) {
      filteredData = filteredData.filter(item => 
        item.name.includes(searchKeyword.value) || 
        item.id.includes(searchKeyword.value)
      )
    }
    
    // 分页处理
    total.value = filteredData.length
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    deviceTableData.value = filteredData.slice(start, end)
  }, 300)
}

// 刷新数据
const refreshData = () => {
  getDeviceTableData()
  ElMessage.success('数据已刷新')
}

// 重置筛选条件
const resetFilters = () => {
  dateRange.value = []
  selectedCategory.value = ''
  searchKeyword.value = ''
  currentPage.value = 1
  getDeviceTableData()
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
  getDeviceTableData()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getDeviceTableData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getDeviceTableData()
}

onMounted(() => {
  // 初始化图表
  const cleanupFunctions = [
    initDeviceTypeChart(),
    initDeviceStatusChart(),
    initDeviceGrowthChart(),
    initTenantDeviceChart()
  ]
  
  // 获取表格数据
  getDeviceTableData()
})

onBeforeUnmount(() => {
  // 清理资源
  cleanupFunctions.forEach(cleanup => cleanup())
})
</script>

<style scoped>
.device-statistics {
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