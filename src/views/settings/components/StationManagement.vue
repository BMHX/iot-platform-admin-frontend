<template>
  <div class="station-management">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAddStation">添加驿站</el-button>
      <el-button type="danger" :disabled="selectedStations.length === 0" @click="handleBatchDelete">批量删除</el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-container">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索驿站名称"
        style="width: 200px; margin-right: 10px"
        clearable
      />
      <el-select
        v-model="stationType"
        placeholder="驿站类型"
        style="width: 150px; margin-right: 10px"
        clearable
      >
        <el-option label="普通驿站" value="normal" />
        <el-option label="配送中心" value="delivery" />
        <el-option label="服务中心" value="service" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <!-- 驿站列表 -->
    <el-table
      :data="stationList"
      border
      style="width: 100%"
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="驿站名称" width="180" />
      <el-table-column prop="type" label="驿站类型" width="100">
        <template #default="scope">
          <el-tag :type="getStationTypeTag(scope.row.type)">
            {{ getStationTypeText(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="address" label="地址" />
      <el-table-column prop="capacity" label="容量" width="80" />
      <el-table-column prop="manager" label="负责人" width="120" />
      <el-table-column prop="contactPhone" label="联系电话" width="140" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="'active'"
            :inactive-value="'inactive'"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click="handleEdit(scope.row)"
          >编辑</el-button>
          <el-button
            size="small"
            type="success"
            @click="handleViewDetails(scope.row)"
          >详情</el-button>
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

    <!-- 添加/编辑驿站对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加驿站' : '编辑驿站'"
      width="600px"
    >
      <el-form
        :model="stationForm"
        label-width="100px"
        :rules="rules"
        ref="stationFormRef"
      >
        <el-form-item label="驿站名称" prop="name">
          <el-input v-model="stationForm.name" placeholder="请输入驿站名称" />
        </el-form-item>
        <el-form-item label="驿站类型" prop="type">
          <el-select v-model="stationForm.type" placeholder="请选择驿站类型" style="width: 100%">
            <el-option label="普通驿站" value="normal" />
            <el-option label="配送中心" value="delivery" />
            <el-option label="服务中心" value="service" />
          </el-select>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="stationForm.address" placeholder="请输入驿站地址" />
        </el-form-item>
        <el-form-item label="容量" prop="capacity">
          <el-input-number v-model="stationForm.capacity" :min="10" :step="10" />
        </el-form-item>
        <el-form-item label="负责人" prop="manager">
          <el-input v-model="stationForm.manager" placeholder="请输入负责人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="stationForm.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="stationForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="营业时间">
          <el-time-picker
            v-model="stationForm.openTime"
            format="HH:mm"
            placeholder="开始时间"
            style="width: 48%; margin-right: 4%"
          />
          <el-time-picker
            v-model="stationForm.closeTime"
            format="HH:mm"
            placeholder="结束时间"
            style="width: 48%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="stationForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitStationForm">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 驿站详情对话框 -->
    <el-dialog
      v-model="detailsDialogVisible"
      title="驿站详情"
      width="700px"
    >
      <div v-if="currentStation">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="驿站名称">{{ currentStation.name }}</el-descriptions-item>
          <el-descriptions-item label="驿站类型">
            <el-tag :type="getStationTypeTag(currentStation.type)">
              {{ getStationTypeText(currentStation.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="地址" :span="2">{{ currentStation.address }}</el-descriptions-item>
          <el-descriptions-item label="容量">{{ currentStation.capacity }}</el-descriptions-item>
          <el-descriptions-item label="已使用">{{ currentStation.usedCapacity || 0 }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ currentStation.manager }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentStation.contactPhone }}</el-descriptions-item>
          <el-descriptions-item label="营业时间">{{ formatTime(currentStation.openTime) }} - {{ formatTime(currentStation.closeTime) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentStation.status === 'active' ? 'success' : 'info'">
              {{ currentStation.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{ currentStation.createTime }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentStation.remark || '无' }}</el-descriptions-item>
        </el-descriptions>

        <div class="station-stats" style="margin-top: 20px;">
          <h4>驿站统计信息</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card shadow="hover">
                <template #header>
                  <div class="stat-header">
                    <span>设备总数</span>
                  </div>
                </template>
                <div class="stat-value">{{ currentStation.deviceCount || 0 }}</div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover">
                <template #header>
                  <div class="stat-header">
                    <span>日均订单量</span>
                  </div>
                </template>
                <div class="stat-value">{{ currentStation.dailyOrders || 0 }}</div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover">
                <template #header>
                  <div class="stat-header">
                    <span>使用率</span>
                  </div>
                </template>
                <div class="stat-value">{{ calculateUsageRate(currentStation) }}%</div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailsDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleEdit(currentStation)">编辑</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 列表数据
const loading = ref(false)
const stationList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')
const stationType = ref('')
const selectedStations = ref([])

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add') // add 或 edit
const stationFormRef = ref(null)
const stationForm = reactive({
  id: '',
  name: '',
  type: 'normal',
  address: '',
  capacity: 100,
  manager: '',
  contactPhone: '',
  status: 'active',
  openTime: new Date(2000, 0, 1, 8, 0),
  closeTime: new Date(2000, 0, 1, 20, 0),
  remark: ''
})

// 详情对话框
const detailsDialogVisible = ref(false)
const currentStation = ref(null)

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入驿站名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择驿站类型', trigger: 'change' }
  ],
  address: [
    { required: true, message: '请输入驿站地址', trigger: 'blur' }
  ],
  capacity: [
    { required: true, message: '请输入容量', trigger: 'blur' }
  ],
  manager: [
    { required: true, message: '请输入负责人姓名', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 获取驿站类型标签类型
const getStationTypeTag = (type) => {
  const typeMap = {
    'normal': 'info',
    'delivery': 'success',
    'service': 'warning'
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

// 格式化时间
const formatTime = (time) => {
  if (!time) return '--'
  const date = new Date(time)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 计算使用率
const calculateUsageRate = (station) => {
  if (!station || !station.capacity || station.capacity === 0) return 0
  const used = station.usedCapacity || 0
  return Math.round((used / station.capacity) * 100)
}

// 获取驿站列表
const getStationList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    // 模拟数据
    const mockStations = [
      {
        id: 1,
        name: '北京西站驿站',
        type: 'normal',
        address: '北京市丰台区莲花池东路118号',
        capacity: 200,
        usedCapacity: 145,
        manager: '张经理',
        contactPhone: '13800138001',
        createTime: '2023-04-10 10:30:00',
        status: 'active',
        openTime: new Date(2000, 0, 1, 7, 0),
        closeTime: new Date(2000, 0, 1, 22, 0),
        remark: '交通枢纽驿站',
        deviceCount: 25,
        dailyOrders: 120
      },
      {
        id: 2,
        name: '中关村配送中心',
        type: 'delivery',
        address: '北京市海淀区中关村大街28号',
        capacity: 500,
        usedCapacity: 320,
        manager: '李主管',
        contactPhone: '13900139002',
        createTime: '2023-04-15 14:20:00',
        status: 'active',
        openTime: new Date(2000, 0, 1, 8, 0),
        closeTime: new Date(2000, 0, 1, 20, 0),
        remark: '高科技园区配送中心',
        deviceCount: 45,
        dailyOrders: 350
      },
      {
        id: 3,
        name: '朝阳区服务中心',
        type: 'service',
        address: '北京市朝阳区建国路89号',
        capacity: 300,
        usedCapacity: 180,
        manager: '王经理',
        contactPhone: '13700137003',
        createTime: '2023-05-01 09:15:00',
        status: 'active',
        openTime: new Date(2000, 0, 1, 9, 0),
        closeTime: new Date(2000, 0, 1, 21, 0),
        remark: '综合服务中心',
        deviceCount: 32,
        dailyOrders: 220
      },
      {
        id: 4,
        name: '通州驿站',
        type: 'normal',
        address: '北京市通州区运河东大街156号',
        capacity: 150,
        usedCapacity: 80,
        manager: '赵主管',
        contactPhone: '13600136004',
        createTime: '2023-05-10 11:40:00',
        status: 'active',
        openTime: new Date(2000, 0, 1, 8, 30),
        closeTime: new Date(2000, 0, 1, 19, 30),
        remark: '社区便民服务点',
        deviceCount: 18,
        dailyOrders: 85
      },
      {
        id: 5,
        name: '昌平配送中心',
        type: 'delivery',
        address: '北京市昌平区回龙观西大街18号',
        capacity: 400,
        usedCapacity: 0,
        manager: '钱经理',
        contactPhone: '13500135005',
        createTime: '2023-05-20 16:25:00',
        status: 'inactive',
        openTime: new Date(2000, 0, 1, 8, 0),
        closeTime: new Date(2000, 0, 1, 20, 0),
        remark: '暂停运营',
        deviceCount: 0,
        dailyOrders: 0
      }
    ]
    
    // 过滤
    let filteredStations = [...mockStations]
    if (searchKeyword.value) {
      filteredStations = filteredStations.filter(s => s.name.includes(searchKeyword.value))
    }
    if (stationType.value) {
      filteredStations = filteredStations.filter(s => s.type === stationType.value)
    }
    
    // 分页
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    stationList.value = filteredStations.slice(start, end)
    total.value = filteredStations.length
    
    loading.value = false
  }, 500)
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedStations.value = selection
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getStationList()
}

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = ''
  stationType.value = ''
  currentPage.value = 1
  getStationList()
}

// 分页变化
const handleSizeChange = (val) => {
  pageSize.value = val
  getStationList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getStationList()
}

// 添加驿站
const handleAddStation = () => {
  dialogType.value = 'add'
  resetStationForm()
  dialogVisible.value = true
}

// 编辑驿站
const handleEdit = (row) => {
  dialogType.value = 'edit'
  // 填充表单
  Object.assign(stationForm, {
    id: row.id,
    name: row.name,
    type: row.type,
    address: row.address,
    capacity: row.capacity,
    manager: row.manager,
    contactPhone: row.contactPhone,
    status: row.status,
    openTime: row.openTime,
    closeTime: row.closeTime,
    remark: row.remark || ''
  })
  dialogVisible.value = true
  
  // 如果是从详情页打开的编辑，先关闭详情对话框
  if (detailsDialogVisible.value) {
    detailsDialogVisible.value = false
  }
}

// 查看详情
const handleViewDetails = (row) => {
  currentStation.value = { ...row }
  detailsDialogVisible.value = true
}

// 删除驿站
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确认删除驿站 ${row.name}?`,
    '删除确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 模拟API请求
      setTimeout(() => {
        const index = stationList.value.findIndex(item => item.id === row.id)
        if (index !== -1) {
          stationList.value.splice(index, 1)
          total.value--
        }
        ElMessage.success('驿站已删除')
      }, 300)
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedStations.value.length === 0) return
  
  ElMessageBox.confirm(
    `确认删除选中的 ${selectedStations.value.length} 个驿站?`,
    '批量删除',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 模拟API请求
      setTimeout(() => {
        const ids = selectedStations.value.map(item => item.id)
        stationList.value = stationList.value.filter(item => !ids.includes(item.id))
        total.value -= ids.length
        
        ElMessage.success(`已删除 ${ids.length} 个驿站`)
        selectedStations.value = []
      }, 300)
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 修改状态
const handleStatusChange = (row) => {
  const statusText = row.status === 'active' ? '启用' : '禁用'
  ElMessage.success(`驿站 ${row.name} 已${statusText}`)
}

// 重置表单
const resetStationForm = () => {
  if (stationFormRef.value) {
    stationFormRef.value.resetFields()
  }
  Object.assign(stationForm, {
    id: '',
    name: '',
    type: 'normal',
    address: '',
    capacity: 100,
    manager: '',
    contactPhone: '',
    status: 'active',
    openTime: new Date(2000, 0, 1, 8, 0),
    closeTime: new Date(2000, 0, 1, 20, 0),
    remark: ''
  })
}

// 提交表单
const submitStationForm = () => {
  if (!stationFormRef.value) return
  
  stationFormRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 添加驿站
        const newStation = {
          id: new Date().getTime(),
          name: stationForm.name,
          type: stationForm.type,
          address: stationForm.address,
          capacity: stationForm.capacity,
          usedCapacity: 0,
          manager: stationForm.manager,
          contactPhone: stationForm.contactPhone,
          createTime: new Date().toLocaleString(),
          status: stationForm.status,
          openTime: stationForm.openTime,
          closeTime: stationForm.closeTime,
          remark: stationForm.remark,
          deviceCount: 0,
          dailyOrders: 0
        }
        stationList.value.unshift(newStation)
        total.value++
        ElMessage.success('驿站添加成功')
      } else {
        // 编辑驿站
        const index = stationList.value.findIndex(item => item.id === stationForm.id)
        if (index !== -1) {
          const updatedStation = {
            ...stationList.value[index],
            name: stationForm.name,
            type: stationForm.type,
            address: stationForm.address,
            capacity: stationForm.capacity,
            manager: stationForm.manager,
            contactPhone: stationForm.contactPhone,
            status: stationForm.status,
            openTime: stationForm.openTime,
            closeTime: stationForm.closeTime,
            remark: stationForm.remark
          }
          stationList.value.splice(index, 1, updatedStation)
        }
        ElMessage.success('驿站信息更新成功')
      }
      
      dialogVisible.value = false
    }
  })
}

onMounted(() => {
  getStationList()
})
</script>

<style scoped>
.station-management {
  width: 100%;
}

.operation-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.search-container {
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

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: #409EFF;
}
</style> 