<template>
  <div class="community-statistics">
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
        <el-select v-model="selectedType" placeholder="小区类型" style="width: 150px; margin-right: 15px;">
          <el-option label="全部类型" value="" />
          <el-option label="住宅小区" value="residential" />
          <el-option label="商业小区" value="commercial" />
          <el-option label="综合小区" value="mixed" />
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
              <div class="data-card-value">{{ communityCount }}</div>
              <div class="data-card-title">小区总数</div>
              <div class="data-card-trend" :class="{ 'up': communityGrowthRate > 0, 'down': communityGrowthRate < 0 }">
                <el-icon v-if="communityGrowthRate > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="communityGrowthRate < 0"><ArrowDown /></el-icon>
                <span>{{ Math.abs(communityGrowthRate) }}%</span>
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
              <div class="data-card-value">{{ buildingCount }}</div>
              <div class="data-card-title">楼栋总数</div>
              <div class="data-card-trend" :class="{ 'up': buildingGrowthRate > 0, 'down': buildingGrowthRate < 0 }">
                <el-icon v-if="buildingGrowthRate > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="buildingGrowthRate < 0"><ArrowDown /></el-icon>
                <span>{{ Math.abs(buildingGrowthRate) }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="data-card-item">
              <div class="data-card-value">{{ residentCount }}</div>
              <div class="data-card-title">住户总数</div>
              <div class="data-card-trend" :class="{ 'up': residentGrowthRate > 0, 'down': residentGrowthRate < 0 }">
                <el-icon v-if="residentGrowthRate > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="residentGrowthRate < 0"><ArrowDown /></el-icon>
                <span>{{ Math.abs(residentGrowthRate) }}%</span>
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
                <span>小区类型分布</span>
              </div>
            </template>
            <div ref="communityTypeChartRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <span>小区数量趋势</span>
              </div>
            </template>
            <div ref="communityTrendChartRef" class="chart"></div>
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
          <span>小区统计详情</span>
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索小区名称" 
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
      <el-table :data="communityTableData" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="小区名称" width="180" />
        <el-table-column prop="type" label="小区类型" width="120">
          <template #default="scope">
            <el-tag :type="getCommunityTypeTag(scope.row.type)">
              {{ getCommunityTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="region" label="所在地区" width="120" />
        <el-table-column prop="buildingCount" label="楼栋数量" width="100" />
        <el-table-column prop="residentCount" label="住户数量" width="100" />
        <el-table-column prop="deviceCount" label="设备数量" width="100" />
        <el-table-column prop="area" label="占地面积" width="120" />
        <el-table-column prop="createTime" label="接入时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
              {{ scope.row.status === 'active' ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
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

// 小区类型筛选
const selectedType = ref('')

// 搜索关键词
const searchKeyword = ref('')

// 数据卡片统计
const communityCount = ref(185)
const deviceCount = ref(1580)
const buildingCount = ref(620)
const residentCount = ref(52350)
const communityGrowthRate = ref(4.5)
const deviceGrowthRate = ref(7.8)
const buildingGrowthRate = ref(3.2)
const residentGrowthRate = ref(5.6)

// 图表引用
const communityTypeChartRef = ref(null)
const communityTrendChartRef = ref(null)
const deviceDistributionChartRef = ref(null)
const regionDistributionChartRef = ref(null)

// 表格数据
const communityTableData = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 获取小区类型标签
const getCommunityTypeTag = (type) => {
  const typeMap = {
    'residential': 'success',
    'commercial': 'warning',
    'mixed': 'primary'
  }
  return typeMap[type] || 'info'
}

// 获取小区类型文本
const getCommunityTypeText = (type) => {
  const typeMap = {
    'residential': '住宅小区',
    'commercial': '商业小区',
    'mixed': '综合小区'
  }
  return typeMap[type] || '未知'
}

// 初始化小区类型分布图表
const initCommunityTypeChart = () => {
  const chartDom = communityTypeChartRef.value
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 'bottom',
      data: ['住宅小区', '商业小区', '综合小区']
    },
    series: [
      {
        name: '小区类型',
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
          { value: 120, name: '住宅小区' },
          { value: 35, name: '商业小区' },
          { value: 30, name: '综合小区' }
        ]
      }
    ]
  }
  myChart.setOption(option)
  window.addEventListener('resize', () => {
    myChart.resize()
  })
}

// 初始化小区数量趋势图表
const initCommunityTrendChart = () => {
  const chartDom = communityTrendChartRef.value
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['小区总数', '新增小区'],
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
        name: '小区总数',
        type: 'line',
        stack: 'Total',
        data: [150, 152, 155, 158, 162, 165, 168, 170, 173, 176, 180, 185],
        smooth: true,
        lineStyle: {
          width: 3
        }
      },
      {
        name: '新增小区',
        type: 'bar',
        data: [2, 2, 3, 3, 4, 3, 3, 2, 3, 3, 4, 5],
        barWidth: '20%'
      }
    ]
  }
  myChart.setOption(option)
  window.addEventListener('resize', () => {
    myChart.resize()
  })
}

// 初始化设备分布图表
const initDeviceDistributionChart = () => {
  const chartDom = deviceDistributionChartRef.value
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 'bottom',
      data: ['安防设备', '环境检测', '能源管理', '智能门禁', '其他设备']
    },
    series: [
      {
        name: '设备类型',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 520, name: '安防设备' },
          { value: 380, name: '环境检测' },
          { value: 350, name: '能源管理' },
          { value: 220, name: '智能门禁' },
          { value: 110, name: '其他设备' }
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
  window.addEventListener('resize', () => {
    myChart.resize()
  })
}

// 初始化地区分布图表
const initRegionDistributionChart = () => {
  const chartDom = regionDistributionChartRef.value
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['小区数量', '设备数量']
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
        name: '小区数量',
        type: 'bar',
        data: [42, 38, 25, 22, 18, 15, 13, 12]
      },
      {
        name: '设备数量',
        type: 'bar',
        data: [380, 350, 220, 190, 150, 120, 100, 70]
      }
    ]
  }
  myChart.setOption(option)
  window.addEventListener('resize', () => {
    myChart.resize()
  })
}

// 获取小区表格数据
const getCommunityTableData = () => {
  // 模拟后端API请求
  setTimeout(() => {
    // 生成模拟数据
    const mockData = [
      {
        id: 1,
        name: '阳光花园小区',
        type: 'residential',
        region: '北京市',
        buildingCount: 12,
        residentCount: 1200,
        deviceCount: 85,
        area: '50000㎡',
        createTime: '2023-03-15 10:30:00',
        status: 'active'
      },
      {
        id: 2,
        name: '星河商业广场',
        type: 'commercial',
        region: '北京市',
        buildingCount: 5,
        residentCount: 0,
        deviceCount: 120,
        area: '30000㎡',
        createTime: '2023-03-20 14:20:00',
        status: 'active'
      },
      {
        id: 3,
        name: '城市综合体',
        type: 'mixed',
        region: '上海市',
        buildingCount: 8,
        residentCount: 800,
        deviceCount: 150,
        area: '80000㎡',
        createTime: '2023-04-05 09:15:00',
        status: 'active'
      },
      {
        id: 4,
        name: '翠湖花园',
        type: 'residential',
        region: '广州市',
        buildingCount: 15,
        residentCount: 1500,
        deviceCount: 95,
        area: '60000㎡',
        createTime: '2023-04-15 11:40:00',
        status: 'active'
      },
      {
        id: 5,
        name: '科技园区',
        type: 'commercial',
        region: '深圳市',
        buildingCount: 10,
        residentCount: 0,
        deviceCount: 180,
        area: '100000㎡',
        createTime: '2023-05-10 16:25:00',
        status: 'inactive'
      },
      {
        id: 6,
        name: '滨海新城',
        type: 'mixed',
        region: '深圳市',
        buildingCount: 20,
        residentCount: 2500,
        deviceCount: 220,
        area: '150000㎡',
        createTime: '2023-04-18 09:45:00',
        status: 'active'
      },
      {
        id: 7,
        name: '幸福家园',
        type: 'residential',
        region: '杭州市',
        buildingCount: 8,
        residentCount: 850,
        deviceCount: 65,
        area: '35000㎡',
        createTime: '2023-03-25 10:15:00',
        status: 'active'
      },
      {
        id: 8,
        name: '金融中心',
        type: 'commercial',
        region: '上海市',
        buildingCount: 3,
        residentCount: 0,
        deviceCount: 90,
        area: '25000㎡',
        createTime: '2023-05-05 14:30:00',
        status: 'active'
      },
      {
        id: 9,
        name: '文化广场',
        type: 'mixed',
        region: '南京市',
        buildingCount: 6,
        residentCount: 600,
        deviceCount: 75,
        area: '40000㎡',
        createTime: '2023-04-12 11:20:00',
        status: 'active'
      },
      {
        id: 10,
        name: '碧水湾',
        type: 'residential',
        region: '成都市',
        buildingCount: 10,
        residentCount: 1000,
        deviceCount: 70,
        area: '45000㎡',
        createTime: '2023-05-15 09:50:00',
        status: 'active'
      }
    ]
    
    // 过滤数据
    let filteredData = [...mockData]
    
    // 根据小区类型筛选
    if (selectedType.value) {
      filteredData = filteredData.filter(item => item.type === selectedType.value)
    }
    
    // 根据搜索关键词筛选
    if (searchKeyword.value) {
      filteredData = filteredData.filter(item => item.name.includes(searchKeyword.value))
    }
    
    // 分页处理
    total.value = filteredData.length
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    communityTableData.value = filteredData.slice(start, end)
  }, 300)
}

// 刷新数据
const refreshData = () => {
  getCommunityTableData()
  ElMessage.success('数据已刷新')
}

// 重置筛选条件
const resetFilters = () => {
  dateRange.value = []
  selectedType.value = ''
  searchKeyword.value = ''
  currentPage.value = 1
  getCommunityTableData()
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
  getCommunityTableData()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getCommunityTableData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getCommunityTableData()
}

onMounted(() => {
  // 初始化图表
  initCommunityTypeChart()
  initCommunityTrendChart()
  initDeviceDistributionChart()
  initRegionDistributionChart()
  
  // 获取表格数据
  getCommunityTableData()
})
</script>

<style scoped>
.community-statistics {
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
  height: 350px;
}

.chart {
  height: 280px;
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
</style> 