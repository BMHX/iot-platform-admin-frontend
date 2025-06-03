<template>
  <div class="user-statistics">
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
        <el-select v-model="selectedRole" placeholder="用户角色" style="width: 150px; margin-right: 15px;">
          <el-option label="全部角色" value="" />
          <el-option label="管理员" value="admin" />
          <el-option label="运营人员" value="operator" />
          <el-option label="普通用户" value="user" />
          <el-option label="租户" value="tenant" />
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
              <div class="data-card-value">{{ totalUsers }}</div>
              <div class="data-card-title">用户总数</div>
              <div class="data-card-trend" :class="{ 'up': userGrowthRate > 0, 'down': userGrowthRate < 0 }">
                <el-icon v-if="userGrowthRate > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="userGrowthRate < 0"><ArrowDown /></el-icon>
                <span>{{ Math.abs(userGrowthRate) }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="data-card-item">
              <div class="data-card-value">{{ activeUsers }}</div>
              <div class="data-card-title">活跃用户</div>
              <div class="data-card-trend up">
                <span>{{ activeRate }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="data-card-item">
              <div class="data-card-value">{{ newUsers }}</div>
              <div class="data-card-title">本月新增</div>
              <div class="data-card-trend" :class="{ 'up': newUserGrowthRate > 0, 'down': newUserGrowthRate < 0 }">
                <el-icon v-if="newUserGrowthRate > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="newUserGrowthRate < 0"><ArrowDown /></el-icon>
                <span>{{ Math.abs(newUserGrowthRate) }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="data-card-item">
              <div class="data-card-value">{{ avgOnlineTime }}</div>
              <div class="data-card-title">平均在线时长</div>
              <div class="data-card-trend" :class="{ 'up': onlineTimeGrowthRate > 0, 'down': onlineTimeGrowthRate < 0 }">
                <el-icon v-if="onlineTimeGrowthRate > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="onlineTimeGrowthRate < 0"><ArrowDown /></el-icon>
                <span>{{ Math.abs(onlineTimeGrowthRate) }}%</span>
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
                <span>用户角色分布</span>
              </div>
            </template>
            <div ref="userRoleChartRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <span>用户增长趋势</span>
              </div>
            </template>
            <div ref="userGrowthChartRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <span>用户活跃度分析</span>
              </div>
            </template>
            <div ref="userActivityChartRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <span>用户地区分布</span>
              </div>
            </template>
            <div ref="userRegionChartRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 数据表格 -->
    <el-card shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="table-header">
          <span>用户统计详情</span>
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索用户名/账号" 
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
          :data="userTableData" 
          border 
          stripe 
          style="width: 100%"
          :header-cell-style="{background:'#f5f7fa',color:'#606266'}"
          :row-class-name="tableRowClassName"
          height="500"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="用户名" min-width="120" show-overflow-tooltip />
          <el-table-column prop="realName" label="真实姓名" min-width="120" show-overflow-tooltip />
          <el-table-column prop="role" label="用户角色" width="120">
            <template #default="scope">
              <el-tag :type="getUserRoleTag(scope.row.role)">
                {{ getUserRoleText(scope.row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="tenantName" label="所属租户" min-width="150" show-overflow-tooltip />
          <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
          <el-table-column prop="phone" label="电话" min-width="130" show-overflow-tooltip />
          <el-table-column prop="registerTime" label="注册时间" min-width="180" sortable show-overflow-tooltip />
          <el-table-column prop="lastLoginTime" label="最近登录" min-width="180" sortable show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100" fixed="right">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
                {{ scope.row.status === 'active' ? '正常' : '禁用' }}
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

// 用户角色筛选
const selectedRole = ref('')

// 搜索关键词
const searchKeyword = ref('')

// 数据卡片统计
const totalUsers = ref(12586)
const activeUsers = ref(8750)
const newUsers = ref(166)
const avgOnlineTime = ref('42分钟')
const userGrowthRate = ref(8.2)
const newUserGrowthRate = ref(-2.3)
const activeRate = ref(69.5)
const onlineTimeGrowthRate = ref(5.8)

// 图表引用
const userRoleChartRef = ref(null)
const userGrowthChartRef = ref(null)
const userActivityChartRef = ref(null)
const userRegionChartRef = ref(null)

// 表格数据
const userTableData = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 清理函数
const cleanupFunctions = []

// 表格行样式
const tableRowClassName = ({ row, rowIndex }) => {
  return rowIndex % 2 === 0 ? 'even-row' : 'odd-row'
}

// 获取用户角色标签
const getUserRoleTag = (role) => {
  const roleMap = {
    'admin': 'danger',
    'operator': 'warning',
    'user': 'info',
    'tenant': 'success'
  }
  return roleMap[role] || 'info'
}

// 获取用户角色文本
const getUserRoleText = (role) => {
  const roleMap = {
    'admin': '管理员',
    'operator': '运营人员',
    'user': '普通用户',
    'tenant': '租户'
  }
  return roleMap[role] || '未知'
}

// 初始化用户角色分布图表
const initUserRoleChart = () => {
  const chartDom = userRoleChartRef.value
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
      data: ['管理员', '运营人员', '普通用户', '租户']
    },
    series: [
      {
        name: '用户角色',
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
          { value: 56, name: '管理员' },
          { value: 235, name: '运营人员' },
          { value: 11850, name: '普通用户' },
          { value: 445, name: '租户' }
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

// 初始化用户增长趋势图表
const initUserGrowthChart = () => {
  const chartDom = userGrowthChartRef.value
  if (!chartDom) return
  
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['用户总量', '新增用户'],
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
        name: '用户总量',
        type: 'line',
        stack: 'Total',
        data: [10200, 10450, 10680, 10950, 11200, 11450, 11680, 11850, 12050, 12250, 12420, 12586],
        smooth: true,
        lineStyle: {
          width: 3
        }
      },
      {
        name: '新增用户',
        type: 'bar',
        data: [250, 250, 230, 270, 250, 250, 230, 170, 200, 200, 170, 166],
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

// 初始化用户活跃度分析图表
const initUserActivityChart = () => {
  const chartDom = userActivityChartRef.value
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
      data: ['日活', '周活', '月活'],
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
        name: '日活',
        type: 'line',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: [2800, 2900, 3100, 3300, 3400, 3500, 3600, 3700, 3800, 3900, 4000, 4200]
      },
      {
        name: '周活',
        type: 'line',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: [4500, 4600, 4700, 4900, 5100, 5300, 5500, 5700, 5900, 6100, 6300, 6500]
      },
      {
        name: '月活',
        type: 'line',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: [6200, 6300, 6500, 6700, 6900, 7100, 7300, 7500, 7800, 8100, 8400, 8750]
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

// 初始化用户地区分布图表
const initUserRegionChart = () => {
  const chartDom = userRegionChartRef.value
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
      data: ['北京', '上海', '广州', '深圳', '杭州', '其他']
    },
    series: [
      {
        name: '用户地区',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 2850, name: '北京' },
          { value: 2450, name: '上海' },
          { value: 1850, name: '广州' },
          { value: 1650, name: '深圳' },
          { value: 1280, name: '杭州' },
          { value: 2506, name: '其他' }
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

// 获取用户表格数据
const getUserTableData = () => {
  // 模拟后端API请求
  setTimeout(() => {
    // 生成模拟数据
    const mockData = [
      {
        id: 1,
        username: 'admin',
        realName: '系统管理员',
        role: 'admin',
        tenantName: '平台总部',
        email: 'admin@iotplatform.com',
        phone: '13800138000',
        registerTime: '2023-01-01 00:00:00',
        lastLoginTime: '2023-06-20 09:15:23',
        status: 'active'
      },
      {
        id: 2,
        username: 'operator1',
        realName: '张运营',
        role: 'operator',
        tenantName: '平台总部',
        email: 'operator1@iotplatform.com',
        phone: '13800138001',
        registerTime: '2023-01-15 10:30:00',
        lastLoginTime: '2023-06-20 08:45:12',
        status: 'active'
      },
      {
        id: 3,
        username: 'schooladmin',
        realName: '李校长',
        role: 'tenant',
        tenantName: '第一实验小学',
        email: 'school@example.com',
        phone: '13800138002',
        registerTime: '2023-02-01 09:15:00',
        lastLoginTime: '2023-06-19 15:30:45',
        status: 'active'
      },
      {
        id: 4,
        username: 'teacher1',
        realName: '王老师',
        role: 'user',
        tenantName: '第一实验小学',
        email: 'teacher1@example.com',
        phone: '13800138003',
        registerTime: '2023-02-10 11:40:00',
        lastLoginTime: '2023-06-20 10:05:18',
        status: 'active'
      },
      {
        id: 5,
        username: 'communityadmin',
        realName: '赵物业',
        role: 'tenant',
        tenantName: '阳光小区',
        email: 'community@example.com',
        phone: '13800138004',
        registerTime: '2023-02-15 16:25:00',
        lastLoginTime: '2023-06-18 18:40:22',
        status: 'active'
      },
      {
        id: 6,
        username: 'resident1',
        realName: '钱业主',
        role: 'user',
        tenantName: '阳光小区',
        email: 'resident1@example.com',
        phone: '13800138005',
        registerTime: '2023-02-20 09:45:00',
        lastLoginTime: '2023-06-20 07:30:10',
        status: 'active'
      },
      {
        id: 7,
        username: 'stationadmin',
        realName: '孙站长',
        role: 'tenant',
        tenantName: '中心驿站',
        email: 'station@example.com',
        phone: '13800138006',
        registerTime: '2023-03-01 10:15:00',
        lastLoginTime: '2023-06-19 16:45:33',
        status: 'active'
      },
      {
        id: 8,
        username: 'staff1',
        realName: '周员工',
        role: 'user',
        tenantName: '中心驿站',
        email: 'staff1@example.com',
        phone: '13800138007',
        registerTime: '2023-03-05 14:30:00',
        lastLoginTime: '2023-06-15 08:20:15',
        status: 'inactive'
      },
      {
        id: 9,
        username: 'operator2',
        realName: '吴运营',
        role: 'operator',
        tenantName: '平台总部',
        email: 'operator2@iotplatform.com',
        phone: '13800138008',
        registerTime: '2023-03-10 11:20:00',
        lastLoginTime: '2023-06-20 09:55:40',
        status: 'active'
      },
      {
        id: 10,
        username: 'teacher2',
        realName: '郑老师',
        role: 'user',
        tenantName: '第二中学',
        email: 'teacher2@example.com',
        phone: '13800138009',
        registerTime: '2023-03-15 09:50:00',
        lastLoginTime: '2023-06-19 14:25:38',
        status: 'active'
      }
    ]
    
    // 过滤数据
    let filteredData = [...mockData]
    
    // 根据用户角色筛选
    if (selectedRole.value) {
      filteredData = filteredData.filter(item => item.role === selectedRole.value)
    }
    
    // 根据搜索关键词筛选
    if (searchKeyword.value) {
      filteredData = filteredData.filter(item => 
        item.username.includes(searchKeyword.value) || 
        item.realName.includes(searchKeyword.value)
      )
    }
    
    // 分页处理
    total.value = filteredData.length
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    userTableData.value = filteredData.slice(start, end)
  }, 300)
}

// 刷新数据
const refreshData = () => {
  getUserTableData()
  ElMessage.success('数据已刷新')
}

// 重置筛选条件
const resetFilters = () => {
  dateRange.value = []
  selectedRole.value = ''
  searchKeyword.value = ''
  currentPage.value = 1
  getUserTableData()
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
  getUserTableData()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getUserTableData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getUserTableData()
}

onMounted(() => {
  // 初始化图表
  const cleanupFunctions = [
    initUserRoleChart(),
    initUserGrowthChart(),
    initUserActivityChart(),
    initUserRegionChart()
  ]
  
  // 获取表格数据
  getUserTableData()
})

onBeforeUnmount(() => {
  // 清理资源
  cleanupFunctions.forEach(cleanup => cleanup())
})
</script>

<style scoped>
.user-statistics {
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