<template>
  <div class="station-statistics">
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
        <el-select v-model="selectedType" placeholder="驿站类型" style="width: 150px; margin-right: 15px;">
          <el-option label="全部类型" value="" />
          <el-option label="普通驿站" value="normal" />
          <el-option label="配送中心" value="delivery" />
          <el-option label="服务中心" value="service" />
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
              <div class="data-card-value">{{ stationCount }}</div>
              <div class="data-card-title">驿站总数</div>
              <div class="data-card-trend" :class="{ 'up': stationGrowthRate > 0, 'down': stationGrowthRate < 0 }">
                <el-icon v-if="stationGrowthRate > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="stationGrowthRate < 0"><ArrowDown /></el-icon>
                <span>{{ Math.abs(stationGrowthRate) }}%</span>
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
              <div class="data-card-value">{{ packageCount }}</div>
              <div class="data-card-title">包裹处理量</div>
              <div class="data-card-trend" :class="{ 'up': packageGrowthRate > 0, 'down': packageGrowthRate < 0 }">
                <el-icon v-if="packageGrowthRate > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="packageGrowthRate < 0"><ArrowDown /></el-icon>
                <span>{{ Math.abs(packageGrowthRate) }}%</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="data-card-item">
              <div class="data-card-value">{{ staffCount }}</div>
              <div class="data-card-title">工作人员</div>
              <div class="data-card-trend" :class="{ 'up': staffGrowthRate > 0, 'down': staffGrowthRate < 0 }">
                <el-icon v-if="staffGrowthRate > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="staffGrowthRate < 0"><ArrowDown /></el-icon>
                <span>{{ Math.abs(staffGrowthRate) }}%</span>
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
                <span>驿站类型分布</span>
              </div>
            </template>
            <div ref="stationTypeChartRef" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <span>驿站数量趋势</span>
              </div>
            </template>
            <div ref="stationTrendChartRef" class="chart"></div>
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
          <span>驿站统计详情</span>
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索驿站名称" 
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
      <el-table :data="stationTableData" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="驿站名称" width="180" />
        <el-table-column prop="type" label="驿站类型" width="120">
          <template #default="scope">
            <el-tag :type="getStationTypeTag(scope.row.type)">
              {{ getStationTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="region" label="所在地区" width="120" />
        <el-table-column prop="address" label="详细地址" width="200" />
        <el-table-column prop="staffCount" label="人员数量" width="100" />
        <el-table-column prop="deviceCount" label="设备数量" width="100" />
        <el-table-column prop="packageCapacity" label="包裹容量" width="100" />
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

// 驿站类型筛选
const selectedType = ref('')

// 搜索关键词
const searchKeyword = ref('')

// 数据卡片统计
const stationCount = ref(65)
const deviceCount = ref(453)
const packageCount = ref('25,680/月')
const staffCount = ref(285)
const stationGrowthRate = ref(10.2)
const deviceGrowthRate = ref(12.8)
const packageGrowthRate = ref(15.6)
const staffGrowthRate = ref(8.4)

// 图表引用
const stationTypeChartRef = ref(null)
const stationTrendChartRef = ref(null)
const deviceDistributionChartRef = ref(null)
const regionDistributionChartRef = ref(null)

// 表格数据
const stationTableData = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 获取驿站类型标签
const getStationTypeTag = (type) => {
  const typeMap = {
    'normal': 'success',
    'delivery': 'warning',
    'service': 'primary'
  }
  return typeMap[type] || 'info'
}

// 获取驿站类型文本
const getStationTypeText = (type) => {
  const typeMap = {
    'normal': '普通驿站',
    'delivery': '配送中心',
    'service': '服务中心'
  }
  return typeMap[type] || '未知'
}

// 初始化驿站类型分布图表
const initStationTypeChart = () => {
  const chartDom = stationTypeChartRef.value
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 'bottom',
      data: ['普通驿站', '配送中心', '服务中心']
    },
    series: [
      {
        name: '驿站类型',
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
          { value: 45, name: '普通驿站' },
          { value: 12, name: '配送中心' },
          { value: 8, name: '服务中心' }
        ]
      }
    ]
  }
  myChart.setOption(option)
  window.addEventListener('resize', () => {
    myChart.resize()
  })
}

// 初始化驿站数量趋势图表
const initStationTrendChart = () => {
  const chartDom = stationTrendChartRef.value
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['驿站总数', '新增驿站'],
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
        name: '驿站总数',
        type: 'line',
        stack: 'Total',
        data: [48, 49, 50, 52, 53, 55, 57, 58, 60, 62, 63, 65],
        smooth: true,
        lineStyle: {
          width: 3
        }
      },
      {
        name: '新增驿站',
        type: 'bar',
        data: [1, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
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
      data: ['包裹柜', '分拣设备', '监控设备', '自助终端', '其他设备']
    },
    series: [
      {
        name: '设备类型',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 180, name: '包裹柜' },
          { value: 120, name: '分拣设备' },
          { value: 85, name: '监控设备' },
          { value: 45, name: '自助终端' },
          { value: 23, name: '其他设备' }
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
      data: ['驿站数量', '设备数量']
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
        name: '驿站数量',
        type: 'bar',
        data: [15, 12, 10, 8, 6, 5, 5, 4]
      },
      {
        name: '设备数量',
        type: 'bar',
        data: [110, 95, 75, 60, 40, 30, 25, 18]
      }
    ]
  }
  myChart.setOption(option)
  window.addEventListener('resize', () => {
    myChart.resize()
  })
}

// 获取驿站表格数据
const getStationTableData = () => {
  // 模拟后端API请求
  setTimeout(() => {
    // 生成模拟数据
    const mockData = [
      {
        id: 1,
        name: '中心驿站',
        type: 'service',
        region: '北京市',
        address: '朝阳区建国路88号',
        staffCount: 20,
        deviceCount: 35,
        packageCapacity: 1500,
        createTime: '2023-03-15 10:30:00',
        status: 'active'
      },
      {
        id: 2,
        name: '西城快递站',
        type: 'normal',
        region: '北京市',
        address: '西城区德胜门外大街15号',
        staffCount: 8,
        deviceCount: 15,
        packageCapacity: 800,
        createTime: '2023-03-20 14:20:00',
        status: 'active'
      },
      {
        id: 3,
        name: '上海配送中心',
        type: 'delivery',
        region: '上海市',
        address: '浦东新区张江高科技园区88号',
        staffCount: 25,
        deviceCount: 45,
        packageCapacity: 2500,
        createTime: '2023-04-05 09:15:00',
        status: 'active'
      },
      {
        id: 4,
        name: '天河驿站',
        type: 'normal',
        region: '广州市',
        address: '天河区天河路385号',
        staffCount: 6,
        deviceCount: 12,
        packageCapacity: 600,
        createTime: '2023-04-15 11:40:00',
        status: 'active'
      },
      {
        id: 5,
        name: '深圳服务中心',
        type: 'service',
        region: '深圳市',
        address: '南山区科技园路10号',
        staffCount: 15,
        deviceCount: 28,
        packageCapacity: 1200,
        createTime: '2023-05-10 16:25:00',
        status: 'inactive'
      },
      {
        id: 6,
        name: '配送总站',
        type: 'delivery',
        region: '上海市',
        address: '嘉定区嘉定工业区88号',
        staffCount: 18,
        deviceCount: 32,
        packageCapacity: 2000,
        createTime: '2023-04-18 09:45:00',
        status: 'active'
      },
      {
        id: 7,
        name: '西湖驿站',
        type: 'normal',
        region: '杭州市',
        address: '西湖区文三路478号',
        staffCount: 5,
        deviceCount: 10,
        packageCapacity: 500,
        createTime: '2023-03-25 10:15:00',
        status: 'active'
      },
      {
        id: 8,
        name: '徐家汇驿站',
        type: 'normal',
        region: '上海市',
        address: '徐汇区虹桥路1号',
        staffCount: 7,
        deviceCount: 13,
        packageCapacity: 650,
        createTime: '2023-05-05 14:30:00',
        status: 'active'
      },
      {
        id: 9,
        name: '江宁服务点',
        type: 'normal',
        region: '南京市',
        address: '江宁区东山街道128号',
        staffCount: 4,
        deviceCount: 8,
        packageCapacity: 400,
        createTime: '2023-04-12 11:20:00',
        status: 'active'
      },
      {
        id: 10,
        name: '武侯驿站',
        type: 'normal',
        region: '成都市',
        address: '武侯区科华北路65号',
        staffCount: 6,
        deviceCount: 11,
        packageCapacity: 550,
        createTime: '2023-05-15 09:50:00',
        status: 'active'
      }
    ]
    
    // 过滤数据
    let filteredData = [...mockData]
    
    // 根据驿站类型筛选
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
    stationTableData.value = filteredData.slice(start, end)
  }, 300)
}

// 刷新数据
const refreshData = () => {
  getStationTableData()
  ElMessage.success('数据已刷新')
}

// 重置筛选条件
const resetFilters = () => {
  dateRange.value = []
  selectedType.value = ''
  searchKeyword.value = ''
  currentPage.value = 1
  getStationTableData()
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
  getStationTableData()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  getStationTableData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getStationTableData()
}

onMounted(() => {
  // 初始化图表
  initStationTypeChart()
  initStationTrendChart()
  initDeviceDistributionChart()
  initRegionDistributionChart()
  
  // 获取表格数据
  getStationTableData()
})
</script>

<style scoped>
.station-statistics {
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