<template>
  <div class="school-statistics">
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
        <el-select v-model="selectedLevel" placeholder="学校级别" style="width: 150px; margin-right: 15px;">
          <el-option label="全部级别" value="" />
          <el-option label="小学" value="primary" />
          <el-option label="初中" value="junior" />
          <el-option label="高中" value="senior" />
          <el-option label="大学" value="university" />
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
              <div class="data-card-value">{{ schoolCount }}</div>
              <div class="data-card-title">学校总数</div>
              <div class="data-card-trend" :class="{ 'up': schoolGrowthRate > 0, 'down': schoolGrowthRate < 0 }">
                <el-icon v-if="schoolGrowthRate > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="schoolGrowthRate < 0"><ArrowDown /></el-icon>
                <span>{{ Math.abs(schoolGrowthRate) }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="data-card-item">
              <div class="data-card-value">{{ deviceCount }}</div>
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
              <div class="data-card-value">{{ studentCount }}</div>
              <div class="data-card-title">学生总数</div>
              <div class="data-card-trend" :class="{ 'up': studentGrowthRate > 0, 'down': studentGrowthRate < 0 }">
                <el-icon v-if="studentGrowthRate > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="studentGrowthRate < 0"><ArrowDown /></el-icon>
                <span>{{ Math.abs(studentGrowthRate) }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="data-card-item">
              <div class="data-card-value">{{ teacherCount }}</div>
              <div class="data-card-title">教师总数</div>
              <div class="data-card-trend" :class="{ 'up': teacherGrowthRate > 0, 'down': teacherGrowthRate < 0 }">
                <el-icon v-if="teacherGrowthRate > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="teacherGrowthRate < 0"><ArrowDown /></el-icon>
                <span>{{ Math.abs(teacherGrowthRate) }}%</span>
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
                <span>学校级别分布</span>
              </div>
            </template>
            <div ref="schoolLevelChartRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <span>学校数量趋势</span>
              </div>
            </template>
            <div ref="schoolTrendChartRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <span>设备分布</span>
              </div>
            </template>
            <div ref="deviceDistributionChartRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <span>地区分布</span>
              </div>
            </template>
            <div ref="regionDistributionChartRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 数据表格 -->
    <el-card shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="table-header">
          <span>学校统计详情</span>
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索学校名称" 
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
          :data="schoolTableData" 
          border 
          stripe 
          style="width: 100%"
          :header-cell-style="{background:'#f5f7fa',color:'#606266'}"
          :row-class-name="tableRowClassName"
          height="500"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="学校名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="level" label="学校级别" width="120">
            <template #default="scope">
              <el-tag :type="getSchoolLevelTag(scope.row.level)">
                {{ getSchoolLevelText(scope.row.level) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="region" label="所在地区" min-width="120" show-overflow-tooltip />
          <el-table-column prop="studentCount" label="学生数量" width="100" sortable />
          <el-table-column prop="teacherCount" label="教师数量" width="100" sortable />
          <el-table-column prop="deviceCount" label="设备数量" width="100" sortable />
          <el-table-column prop="buildingCount" label="教学楼数" width="100" sortable />
          <el-table-column prop="createTime" label="接入时间" min-width="180" sortable show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100" fixed="right">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
                {{ scope.row.status === 'active' ? '在线' : '离线' }}
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

// 学校级别筛选
const selectedLevel = ref('')

// 搜索关键词
const searchKeyword = ref('')

// 数据卡片统计
const schoolCount = ref(235)
const deviceCount = ref(3850)
const studentCount = ref(125800)
const teacherCount = ref(8520)
const schoolGrowthRate = ref(5.2)
const deviceGrowthRate = ref(8.7)
const studentGrowthRate = ref(3.5)
const teacherGrowthRate = ref(4.2)

// 图表引用
const schoolLevelChartRef = ref(null)
const schoolTrendChartRef = ref(null)
const deviceDistributionChartRef = ref(null)
const regionDistributionChartRef = ref(null)

// 表格数据
const schoolTableData = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 表格行样式
const tableRowClassName = ({ row, rowIndex }) => {
  return rowIndex % 2 === 0 ? 'even-row' : 'odd-row'
}

// 获取学校级别标签
const getSchoolLevelTag = (level) => {
  const levelMap = {
    'primary': 'success',
    'junior': 'warning',
    'senior': 'danger',
    'university': 'primary'
  }
  return levelMap[level] || 'info'
}

// 获取学校级别文本
const getSchoolLevelText = (level) => {
  const levelMap = {
    'primary': '小学',
    'junior': '初中',
    'senior': '高中',
    'university': '大学'
  }
  return levelMap[level] || '未知'
}

// 清理函数
const cleanupFunctions = []

// 初始化学校级别分布图表
const initSchoolLevelChart = () => {
  const chartDom = schoolLevelChartRef.value
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
      data: ['小学', '初中', '高中', '大学']
    },
    series: [
      {
        name: '学校级别',
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
          { value: 95, name: '小学', itemStyle: { color: '#67C23A' } },
          { value: 65, name: '初中', itemStyle: { color: '#E6A23C' } },
          { value: 55, name: '高中', itemStyle: { color: '#F56C6C' } },
          { value: 20, name: '大学', itemStyle: { color: '#409EFF' } }
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

// 初始化学校数量趋势图表
const initSchoolTrendChart = () => {
  const chartDom = schoolTrendChartRef.value
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['学校总数', '新增学校'],
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
        name: '学校总数',
        type: 'line',
        stack: 'Total',
        data: [210, 214, 218, 220, 223, 225, 227, 228, 230, 232, 233, 235],
        smooth: true,
        lineStyle: {
          width: 3
        }
      },
      {
        name: '新增学校',
        type: 'bar',
        data: [4, 4, 4, 2, 3, 2, 2, 1, 2, 2, 1, 2],
        barWidth: '20%'
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

// 初始化设备分布图表
const initDeviceDistributionChart = () => {
  const chartDom = deviceDistributionChartRef.value
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
        radius: '50%',
        data: [
          { value: 1850, name: '教学设备' },
          { value: 880, name: '安防设备' },
          { value: 580, name: '环境检测' },
          { value: 420, name: '能源管理' },
          { value: 120, name: '其他设备' }
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

// 初始化地区分布图表
const initRegionDistributionChart = () => {
  const chartDom = regionDistributionChartRef.value
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
      data: ['学校数量', '设备数量']
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
      data: ['北京市', '上海市', '广州市', '深圳市', '杭州市', '南京市', '成都市', '武汉市']
    },
    series: [
      {
        name: '学校数量',
        type: 'bar',
        data: [45, 40, 32, 28, 25, 22, 20, 18]
      },
      {
        name: '设备数量',
        type: 'bar',
        data: [780, 720, 580, 520, 450, 380, 350, 320]
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

// 获取学校表格数据
const getSchoolTableData = () => {
  // 模拟后端API请求
  setTimeout(() => {
    // 生成模拟数据
    const mockData = [
      {
        id: 1,
        name: '第一实验小学',
        level: 'primary',
        region: '北京市',
        studentCount: 1200,
        teacherCount: 80,
        deviceCount: 120,
        buildingCount: 4,
        createTime: '2023-03-15 10:30:00',
        status: 'active'
      },
      {
        id: 2,
        name: '第二中学',
        level: 'junior',
        region: '北京市',
        studentCount: 1500,
        teacherCount: 95,
        deviceCount: 150,
        buildingCount: 5,
        createTime: '2023-03-20 14:20:00',
        status: 'active'
      },
      {
        id: 3,
        name: '复兴高级中学',
        level: 'senior',
        region: '上海市',
        studentCount: 1800,
        teacherCount: 110,
        deviceCount: 180,
        buildingCount: 6,
        createTime: '2023-04-05 09:15:00',
        status: 'active'
      },
      {
        id: 4,
        name: '华东师范大学',
        level: 'university',
        region: '上海市',
        studentCount: 20000,
        teacherCount: 1200,
        deviceCount: 850,
        buildingCount: 25,
        createTime: '2023-04-15 11:40:00',
        status: 'active'
      },
      {
        id: 5,
        name: '天河实验学校',
        level: 'primary',
        region: '广州市',
        studentCount: 1000,
        teacherCount: 70,
        deviceCount: 100,
        buildingCount: 3,
        createTime: '2023-05-10 16:25:00',
        status: 'inactive'
      },
      {
        id: 6,
        name: '南山外国语学校',
        level: 'junior',
        region: '深圳市',
        studentCount: 1600,
        teacherCount: 100,
        deviceCount: 160,
        buildingCount: 6,
        createTime: '2023-04-18 09:45:00',
        status: 'active'
      },
      {
        id: 7,
        name: '西湖高级中学',
        level: 'senior',
        region: '杭州市',
        studentCount: 1700,
        teacherCount: 105,
        deviceCount: 170,
        buildingCount: 5,
        createTime: '2023-03-25 10:15:00',
        status: 'active'
      },
      {
        id: 8,
        name: '南京大学',
        level: 'university',
        region: '南京市',
        studentCount: 22000,
        teacherCount: 1300,
        deviceCount: 900,
        buildingCount: 28,
        createTime: '2023-05-05 14:30:00',
        status: 'active'
      },
      {
        id: 9,
        name: '成都七中',
        level: 'senior',
        region: '成都市',
        studentCount: 2000,
        teacherCount: 120,
        deviceCount: 200,
        buildingCount: 7,
        createTime: '2023-04-12 11:20:00',
        status: 'active'
      },
      {
        id: 10,
        name: '武汉实验小学',
        level: 'primary',
        region: '武汉市',
        studentCount: 950,
        teacherCount: 65,
        deviceCount: 95,
        buildingCount: 3,
        createTime: '2023-05-15 09:50:00',
        status: 'active'
      }
    ]
    
    // 过滤数据
    let filteredData = [...mockData]
    
    // 根据学校级别筛选
    if (selectedLevel.value) {
      filteredData = filteredData.filter(item => item.level === selectedLevel.value)
    }
    
    // 根据搜索关键词筛选
    if (searchKeyword.value) {
      filteredData = filteredData.filter(item => item.name.includes(searchKeyword.value))
    }
    
    // 分页处理
    total.value = filteredData.length
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    schoolTableData.value = filteredData.slice(start, end)
  }, 300)
}

// 刷新数据
const refreshData = () => {
  getSchoolTableData()
  ElMessage.success('数据已刷新')
}

// 重置筛选条件
const resetFilters = () => {
  dateRange.value = []
  selectedLevel.value = ''
  searchKeyword.value = ''
  currentPage.value = 1
  getSchoolTableData()
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
  getSchoolTableData()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getSchoolTableData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getSchoolTableData()
}

onMounted(() => {
  // 初始化图表
  cleanupFunctions.push(initSchoolLevelChart())
  cleanupFunctions.push(initSchoolTrendChart())
  cleanupFunctions.push(initDeviceDistributionChart())
  cleanupFunctions.push(initRegionDistributionChart())
  
  // 获取表格数据
  getSchoolTableData()
})

onBeforeUnmount(() => {
  // 清理所有图表资源
  cleanupFunctions.forEach(cleanup => typeof cleanup === 'function' && cleanup())
})
</script>

<style scoped>
.school-statistics {
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