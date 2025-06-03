<template>
  <div class="devices-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设备管理</span>
          <el-button type="primary" @click="showAddDeviceDialog">添加设备</el-button>
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
          <el-option label="在线" value="online" />
          <el-option label="离线" value="offline" />
          <el-option label="告警" value="alarm" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>

      <!-- 设备列表 -->
      <el-table :data="deviceList" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="设备ID" width="150" />
        <el-table-column prop="name" label="设备名称" width="200" />
        <el-table-column prop="type" label="设备类型" width="150" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.status === 'online' ? 'success' : scope.row.status === 'offline' ? 'info' : 'danger'"
            >
              {{ scope.row.status === 'online' ? '在线' : scope.row.status === 'offline' ? '离线' : '告警' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastActiveTime" label="最后活跃时间" width="180" />
        <el-table-column prop="location" label="位置" min-width="150" show-overflow-tooltip />
        <el-table-column label="坐标" min-width="180">
          <template #default="scope">
            <span v-if="scope.row.latitude && scope.row.longitude">
              {{ scope.row.latitude }}, {{ scope.row.longitude }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button
              size="small"
              @click="handleView(scope.row)"
            >查看</el-button>
            <el-button
              size="small"
              type="primary"
              @click="handleEdit(scope.row)"
            >编辑</el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
            >删除</el-button>
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

    <!-- 添加/编辑设备对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加设备' : '编辑设备'"
      width="500px"
    >
      <el-form
        :model="deviceForm"
        label-width="100px"
        :rules="rules"
        ref="deviceFormRef"
      >
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="deviceForm.name" />
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-select v-model="deviceForm.type" placeholder="请选择设备类型" style="width: 100%">
            <el-option label="传感器" value="sensor" />
            <el-option label="控制器" value="controller" />
            <el-option label="网关" value="gateway" />
            <el-option label="摄像头" value="camera" />
          </el-select>
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <div style="display: flex; align-items: center;">
            <el-input v-model="deviceForm.location" style="margin-right: 10px" />
            <el-button type="primary" @click="getCurrentPosition">
              <el-icon><Location /></el-icon>
              定位
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="经度" prop="longitude">
          <el-input v-model="deviceForm.longitude" />
        </el-form-item>
        <el-form-item label="纬度" prop="latitude">
          <el-input v-model="deviceForm.latitude" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="deviceForm.description" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitDeviceForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Location } from '@element-plus/icons-vue'
import { useDeviceStore } from '../../stores/device'

const deviceStore = useDeviceStore()

// 列表数据
const loading = ref(false)
const deviceList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const statusFilter = ref('')

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add') // add 或 edit
const deviceFormRef = ref(null)
const deviceForm = reactive({
  id: '',
  name: '',
  type: '',
  location: '',
  latitude: '',
  longitude: '',
  description: ''
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  location: [{ required: true, message: '请输入设备位置', trigger: 'blur' }]
}

// 获取设备列表
const getDeviceList = () => {
  loading.value = true
  
  // 这里模拟API请求，实际项目中应从后端获取数据
  setTimeout(() => {
    // 模拟数据
    const mockDevices = Array(20).fill(0).map((_, index) => {
      // 随机生成经纬度数据，中国大致范围
      const latitude = (30 + Math.random() * 10).toFixed(6)
      const longitude = (100 + Math.random() * 20).toFixed(6)
      
      return {
        id: `DEV${String(index + 1).padStart(5, '0')}`,
        name: `测试设备${index + 1}`,
        type: ['sensor', 'controller', 'gateway', 'camera'][Math.floor(Math.random() * 4)],
        status: ['online', 'offline', 'alarm'][Math.floor(Math.random() * 3)],
        lastActiveTime: new Date().toLocaleString(),
        location: `位置${index + 1}`,
        latitude,
        longitude,
        description: `这是测试设备${index + 1}的描述`
      }
    })
    
    // 过滤
    let filteredDevices = [...mockDevices]
    if (searchQuery.value) {
      filteredDevices = filteredDevices.filter(
        device => device.name.includes(searchQuery.value) || device.id.includes(searchQuery.value)
      )
    }
    if (statusFilter.value) {
      filteredDevices = filteredDevices.filter(device => device.status === statusFilter.value)
    }
    
    // 分页
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    deviceList.value = filteredDevices.slice(start, end)
    total.value = filteredDevices.length
    
    // 设置设备统计信息
    const stats = {
      total: filteredDevices.length,
      online: filteredDevices.filter(d => d.status === 'online').length,
      offline: filteredDevices.filter(d => d.status === 'offline').length,
      alarm: filteredDevices.filter(d => d.status === 'alarm').length
    }
    
    // 更新设备store
    deviceStore.setDeviceList(deviceList.value)
    deviceStore.setDeviceStats(stats)
    
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getDeviceList()
}

// 重置搜索
const resetSearch = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  currentPage.value = 1
  getDeviceList()
}

// 分页变化
const handleSizeChange = (val) => {
  pageSize.value = val
  getDeviceList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getDeviceList()
}

// 添加设备
const showAddDeviceDialog = () => {
  dialogType.value = 'add'
  resetDeviceForm()
  dialogVisible.value = true
}

// 查看设备
const handleView = (row) => {
  ElMessage.info(`查看设备: ${row.name}`)
  // 这里可以导航到设备详情页
}

// 编辑设备
const handleEdit = (row) => {
  dialogType.value = 'edit'
  // 填充表单
  Object.assign(deviceForm, {
    id: row.id,
    name: row.name,
    type: row.type,
    location: row.location,
    latitude: row.latitude || '',
    longitude: row.longitude || '',
    description: row.description
  })
  dialogVisible.value = true
}

// 删除设备
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确认删除设备 ${row.name}?`,
    '删除确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 这里应调用删除API，这里模拟成功
      ElMessage.success('设备已删除')
      getDeviceList()
    })
    .catch(() => {
      // 用户取消删除
    })
}

// 重置表单
const resetDeviceForm = () => {
  if (deviceFormRef.value) {
    deviceFormRef.value.resetFields()
  }
  Object.assign(deviceForm, {
    id: '',
    name: '',
    type: '',
    location: '',
    latitude: '',
    longitude: '',
    description: ''
  })
}

// 提交表单
const submitDeviceForm = () => {
  if (!deviceFormRef.value) return
  
  deviceFormRef.value.validate((valid) => {
    if (valid) {
      // 这里应调用添加/编辑API，这里模拟成功
      if (dialogType.value === 'add') {
        // 模拟添加新设备
        const newDevice = {
          id: `DEV${new Date().getTime()}`,
          name: deviceForm.name,
          type: deviceForm.type,
          status: 'online',
          lastActiveTime: new Date().toLocaleString(),
          location: deviceForm.location,
          latitude: deviceForm.latitude,
          longitude: deviceForm.longitude,
          description: deviceForm.description
        }
        
        // 将新设备添加到列表
        deviceList.value.unshift(newDevice)
        total.value++
        
        // 保存设备位置信息到store
        deviceStore.addDeviceLocation(newDevice)
      } else {
        // 模拟更新设备
        const index = deviceList.value.findIndex(device => device.id === deviceForm.id)
        if (index !== -1) {
          deviceList.value[index] = {
            ...deviceList.value[index],
            name: deviceForm.name,
            type: deviceForm.type,
            location: deviceForm.location,
            latitude: deviceForm.latitude,
            longitude: deviceForm.longitude,
            description: deviceForm.description
          }
          
          // 更新设备位置信息到store
          deviceStore.addDeviceLocation(deviceList.value[index])
        }
      }
      
      ElMessage.success(dialogType.value === 'add' ? '设备添加成功' : '设备更新成功')
      dialogVisible.value = false
      
      // 刷新设备列表
      // getDeviceList()
    }
  })
}

// 获取当前位置
const getCurrentPosition = () => {
  if (!navigator.geolocation) {
    ElMessage.warning('您的浏览器不支持获取地理位置')
    return
  }
  
  ElMessage.info('正在获取位置信息...')
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      deviceForm.latitude = position.coords.latitude.toFixed(6)
      deviceForm.longitude = position.coords.longitude.toFixed(6)
      ElMessage.success('位置信息获取成功')
    },
    (error) => {
      let errorMessage = '获取位置信息失败'
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = '用户拒绝了位置请求'
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = '位置信息不可用'
          break
        case error.TIMEOUT:
          errorMessage = '获取位置超时'
          break
      }
      ElMessage.error(errorMessage)
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  )
}

onMounted(() => {
  getDeviceList()
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
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 