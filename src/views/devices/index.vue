<template>
  <div class="devices-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设备管理</span>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="filter-container">
        <el-input
          v-model="searchQuery"
          placeholder="请输入设备名称/ID"
          style="width: 200px; margin-right: 10px"
          clearable
        />
        <el-select
          v-model="statusFilter"
          placeholder="设备状态"
          style="width: 130px; margin-right: 10px"
          clearable
        >
          <el-option label="在线" value="1" />
          <el-option label="离线" value="0" />
          <el-option label="告警" value="2" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>

      <!-- 设备列表 -->
      <el-table :data="deviceList" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="设备ID" width="150" />
        <el-table-column prop="deviceName" label="设备名称" width="200" />
        <el-table-column prop="deviceType" label="设备类型" width="150" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag
              :type="getStatusType(scope.row.status)"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="最后活跃时间" width="180" />
        <el-table-column label="坐标" min-width="180">
          <template #default="scope">
            <span v-if="scope.row.latitude && scope.row.longitude">
              {{ scope.row.latitude }}, {{ scope.row.longitude }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useDeviceStore } from '../../stores/device'
import { getDeviceList } from '../../api/device'

const deviceStore = useDeviceStore()

// 列表数据
const loading = ref(false)
const deviceList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const statusFilter = ref('')

// 获取设备列表
const getDevices = () => {
  loading.value = true
  
  // 构建查询参数
  const params = {
    page: currentPage.value,
    limit: pageSize.value,
    keyword: searchQuery.value,
    status: statusFilter.value
  }
  
  // 调用API
  getDeviceList(params).then(res => {
    if (res.code === 0 || res.code === 200) {
      // 更新设备列表和总数
      deviceList.value = res.data.list || []
      total.value = res.data.total || 0
      
      // 更新设备状态统计信息
      if (res.data.stats) {
        deviceStore.setDeviceStats(res.data.stats)
      } else {
        // 如果接口未返回统计信息，手动计算
        const stats = {
          total: deviceList.value.length,
          online: deviceList.value.filter(d => d.status === '1').length,
          offline: deviceList.value.filter(d => d.status === '0').length,
          alarm: deviceList.value.filter(d => d.status === '2').length
        }
        deviceStore.setDeviceStats(stats)
      }
      
      // 更新设备列表到store
      deviceStore.setDeviceList(deviceList.value)
    } else {
      ElMessage.error(res.message || '获取设备列表失败')
    }
    loading.value = false
  }).catch(error => {
    console.error('获取设备列表失败:', error)
    ElMessage.error('获取设备列表失败')
    loading.value = false
    
    // 使用模拟数据
    useMockData()
  })
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    '0': 'info',    // 离线
    '1': 'success', // 在线
    '2': 'danger'   // 告警
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    '0': '离线',
    '1': '在线',
    '2': '告警'
  }
  return statusMap[status] || '未知'
}

// 使用模拟数据（API调用失败时的备选方案）
const useMockData = () => {
  // 模拟数据
  const mockDevices = Array(20).fill(0).map((_, index) => {
    // 随机生成经纬度数据，中国大致范围
    const latitude = (30 + Math.random() * 10).toFixed(6)
    const longitude = (100 + Math.random() * 20).toFixed(6)
    
    return {
      id: index + 1,
      deviceName: `测试设备${index + 1}`,
      deviceType: ['传感器', '控制器', '网关', '摄像头'][Math.floor(Math.random() * 4)],
      status: ['0', '1', '2'][Math.floor(Math.random() * 3)],
      updatedAt: new Date().toLocaleString(),
      location: `位置${index + 1}`,
      latitude,
      longitude,
      description: `这是测试设备${index + 1}的描述信息`
    }
  })
  
  deviceList.value = mockDevices
  total.value = mockDevices.length
  
  // 更新设备状态统计信息
  const stats = {
    total: mockDevices.length,
    online: mockDevices.filter(d => d.status === '1').length,
    offline: mockDevices.filter(d => d.status === '0').length,
    alarm: mockDevices.filter(d => d.status === '2').length
  }
  deviceStore.setDeviceStats(stats)
  
  // 更新设备列表到store
  deviceStore.setDeviceList(mockDevices)
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getDevices()
}

// 重置搜索
const resetSearch = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  currentPage.value = 1
  getDevices()
}

// 分页变化
const handleSizeChange = (val) => {
  pageSize.value = val
  getDevices()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getDevices()
}

// 页面加载时获取设备列表
onMounted(() => {
  getDevices()
})
</script>

<style scoped>
.devices-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 