<template>
  <div class="app-user-management">
    <!-- 搜索和筛选 -->
    <div class="filter-container">
      <el-input
        v-model="searchQuery"
        placeholder="用户名/手机号"
        style="width: 200px; margin-right: 10px"
        clearable
      />
      <el-select
        v-model="tenantFilter"
        placeholder="所属租户"
        style="width: 150px; margin-right: 10px"
        clearable
      >
        <el-option 
          v-for="item in tenantOptions" 
          :key="item.value" 
          :label="item.label" 
          :value="item.value" 
        />
      </el-select>
      <el-select
        v-model="tenantTypeFilter"
        placeholder="租户类型"
        style="width: 150px; margin-right: 10px"
        clearable
      >
        <el-option label="学校" value="school" />
        <el-option label="小区" value="community" />
        <el-option label="驿站" value="station" />
      </el-select>
      <el-select
        v-model="statusFilter"
        placeholder="状态"
        style="width: 130px; margin-right: 10px"
        clearable
      >
        <el-option label="启用" value="enabled" />
        <el-option label="禁用" value="disabled" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <!-- 用户列表 -->
    <el-table :data="userList" border style="width: 100%; margin-top: 20px" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="phone" label="手机号" width="150" />
      <el-table-column prop="tenantName" label="所属租户" width="150" />
      <el-table-column prop="tenantType" label="租户类型" width="100">
        <template #default="scope">
          <el-tag
            :type="scope.row.tenantType === 'school' ? 'success' : scope.row.tenantType === 'community' ? 'warning' : 'info'"
          >
            {{ scope.row.tenantType === 'school' ? '学校' : scope.row.tenantType === 'community' ? '小区' : '驿站' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="'enabled'"
            :inactive-value="'disabled'"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="registerTime" label="注册时间" width="180" />
      <el-table-column prop="lastActiveTime" label="最后活跃时间" width="180" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click="handleViewDetail(scope.row)"
          >查看详情</el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDisable(scope.row)"
            v-if="scope.row.status === 'enabled'"
          >禁用</el-button>
          <el-button
            size="small"
            type="success"
            @click="handleEnable(scope.row)"
            v-else
          >启用</el-button>
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

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="用户详情"
      width="700px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentUser.phone }}</el-descriptions-item>
        <el-descriptions-item label="所属租户">{{ currentUser.tenantName }}</el-descriptions-item>
        <el-descriptions-item label="租户类型">
          <el-tag
            :type="currentUser.tenantType === 'school' ? 'success' : currentUser.tenantType === 'community' ? 'warning' : 'info'"
          >
            {{ currentUser.tenantType === 'school' ? '学校' : currentUser.tenantType === 'community' ? '小区' : '驿站' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentUser.status === 'enabled' ? 'success' : 'danger'">
            {{ currentUser.status === 'enabled' ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentUser.registerTime }}</el-descriptions-item>
        <el-descriptions-item label="最后活跃时间">{{ currentUser.lastActiveTime }}</el-descriptions-item>
        <el-descriptions-item label="设备使用记录" :span="2">
          <el-table :data="currentUser.deviceRecords || []" border size="small">
            <el-table-column prop="deviceId" label="设备ID" width="100" />
            <el-table-column prop="deviceName" label="设备名称" width="150" />
            <el-table-column prop="useTime" label="使用时间" width="180" />
            <el-table-column prop="duration" label="使用时长" width="100" />
          </el-table>
        </el-descriptions-item>
        <el-descriptions-item label="登录日志" :span="2">
          <el-table :data="currentUser.loginLogs || []" border size="small">
            <el-table-column prop="loginTime" label="登录时间" width="180" />
            <el-table-column prop="ipAddress" label="IP地址" width="150" />
            <el-table-column prop="deviceInfo" label="设备信息" />
          </el-table>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
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
const userList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const tenantFilter = ref('')
const tenantTypeFilter = ref('')
const statusFilter = ref('')

// 租户选项
const tenantOptions = ref([])

// 详情对话框
const detailDialogVisible = ref(false)
const currentUser = ref({})

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    // 这里应该调用API获取数据
    // 模拟数据
    setTimeout(() => {
      userList.value = [
        {
          id: 1,
          username: 'user1',
          phone: '13800138001',
          tenantName: '第一中学',
          tenantType: 'school',
          status: 'enabled',
          registerTime: '2023-05-01 10:00:00',
          lastActiveTime: '2023-05-27 15:30:00'
        },
        {
          id: 2,
          username: 'user2',
          phone: '13800138002',
          tenantName: '阳光小区',
          tenantType: 'community',
          status: 'enabled',
          registerTime: '2023-04-15 14:20:00',
          lastActiveTime: '2023-05-26 09:15:00'
        },
        {
          id: 3,
          username: 'user3',
          phone: '13800138003',
          tenantName: '中央驿站',
          tenantType: 'station',
          status: 'disabled',
          registerTime: '2023-03-10 09:30:00',
          lastActiveTime: '2023-04-20 16:45:00'
        }
      ]
      total.value = 3
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取用户列表失败', error)
    ElMessage.error('获取用户列表失败')
    loading.value = false
  }
}

// 获取租户选项
const fetchTenantOptions = () => {
  // 这里应该调用API获取数据
  // 模拟数据
  tenantOptions.value = [
    { label: '第一中学', value: '1' },
    { label: '阳光小区', value: '2' },
    { label: '中央驿站', value: '3' }
  ]
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchUserList()
}

// 重置搜索
const resetSearch = () => {
  searchQuery.value = ''
  tenantFilter.value = ''
  tenantTypeFilter.value = ''
  statusFilter.value = ''
  currentPage.value = 1
  fetchUserList()
}

// 分页
const handleSizeChange = (size) => {
  pageSize.value = size
  fetchUserList()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchUserList()
}

// 状态变更
const handleStatusChange = (row) => {
  ElMessage.success(`用户 ${row.username} 状态已更新为 ${row.status === 'enabled' ? '启用' : '禁用'}`)
}

// 禁用用户
const handleDisable = (row) => {
  ElMessageBox.confirm(`确定要禁用用户 ${row.username} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'disabled'
    ElMessage.success(`用户 ${row.username} 已禁用`)
  }).catch(() => {})
}

// 启用用户
const handleEnable = (row) => {
  ElMessageBox.confirm(`确定要启用用户 ${row.username} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'enabled'
    ElMessage.success(`用户 ${row.username} 已启用`)
  }).catch(() => {})
}

// 查看详情
const handleViewDetail = (row) => {
  currentUser.value = { ...row }
  // 模拟获取详细数据
  currentUser.value.deviceRecords = [
    { deviceId: 'D001', deviceName: '门禁设备A', useTime: '2023-05-27 08:30:00', duration: '5秒' },
    { deviceId: 'D002', deviceName: '电梯控制器', useTime: '2023-05-26 17:45:00', duration: '10秒' }
  ]
  currentUser.value.loginLogs = [
    { loginTime: '2023-05-27 15:30:00', ipAddress: '192.168.1.100', deviceInfo: 'iPhone 13 iOS 16.5' },
    { loginTime: '2023-05-26 09:15:00', ipAddress: '192.168.1.101', deviceInfo: 'iPhone 13 iOS 16.5' }
  ]
  detailDialogVisible.value = true
}

onMounted(() => {
  fetchUserList()
  fetchTenantOptions()
})
</script>

<style scoped>
.app-user-management {
  width: 100%;
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 