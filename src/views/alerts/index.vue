<template>
  <div class="alerts-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>告警管理</span>
          <div>
            <el-button type="primary" @click="refreshAlerts">刷新</el-button>
            <el-button type="danger" @click="batchClear" :disabled="selectedAlerts.length === 0">批量清除</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="filter-container">
        <el-input
          v-model="searchKeyword"
          placeholder="设备名称/ID"
          style="width: 200px; margin-right: 10px"
          clearable
        />
        <el-select
          v-model="severityFilter"
          placeholder="告警级别"
          style="width: 130px; margin-right: 10px"
          clearable
        >
          <el-option label="严重" value="critical" />
          <el-option label="警告" value="warning" />
          <el-option label="提示" value="info" />
        </el-select>
        <el-select
          v-model="statusFilter"
          placeholder="告警状态"
          style="width: 130px; margin-right: 10px"
          clearable
        >
          <el-option label="未处理" value="unresolved" />
          <el-option label="已确认" value="acknowledged" />
          <el-option label="已解决" value="resolved" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 280px; margin-right: 10px"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>

      <!-- 告警列表 -->
      <el-table 
        :data="alertList" 
        border 
        style="width: 100%" 
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="告警ID" width="100" />
        <el-table-column prop="deviceId" label="设备ID" width="120" />
        <el-table-column prop="deviceName" label="设备名称" width="150" />
        <el-table-column label="告警级别" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.severity === 'critical' ? 'danger' : scope.row.severity === 'warning' ? 'warning' : 'info'"
            >
              {{ scope.row.severity === 'critical' ? '严重' : scope.row.severity === 'warning' ? '警告' : '提示' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="告警内容" show-overflow-tooltip />
        <el-table-column prop="timestamp" label="时间" width="160" sortable />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag
              :type="
                scope.row.status === 'unresolved' 
                  ? 'danger' 
                  : scope.row.status === 'acknowledged' 
                    ? 'warning' 
                    : 'success'
              "
            >
              {{ 
                scope.row.status === 'unresolved' 
                  ? '未处理' 
                  : scope.row.status === 'acknowledged' 
                    ? '已确认' 
                    : '已解决' 
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'unresolved'"
              size="small"
              @click="handleAcknowledge(scope.row)"
            >确认</el-button>
            <el-button
              v-if="scope.row.status !== 'resolved'"
              size="small"
              type="success"
              @click="handleResolve(scope.row)"
            >解决</el-button>
            <el-button
              size="small"
              type="primary"
              @click="handleDetail(scope.row)"
            >详情</el-button>
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

    <!-- 告警详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="告警详情"
      width="600px"
    >
      <div v-if="currentAlert">
        <div class="detail-item">
          <span class="detail-label">告警ID:</span>
          <span class="detail-value">{{ currentAlert.id }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">设备ID:</span>
          <span class="detail-value">{{ currentAlert.deviceId }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">设备名称:</span>
          <span class="detail-value">{{ currentAlert.deviceName }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">告警级别:</span>
          <span class="detail-value">
            <el-tag
              :type="currentAlert.severity === 'critical' ? 'danger' : currentAlert.severity === 'warning' ? 'warning' : 'info'"
            >
              {{ currentAlert.severity === 'critical' ? '严重' : currentAlert.severity === 'warning' ? '警告' : '提示' }}
            </el-tag>
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">告警时间:</span>
          <span class="detail-value">{{ currentAlert.timestamp }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">告警内容:</span>
          <span class="detail-value">{{ currentAlert.message }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">告警状态:</span>
          <span class="detail-value">
            <el-tag
              :type="
                currentAlert.status === 'unresolved' 
                  ? 'danger' 
                  : currentAlert.status === 'acknowledged' 
                    ? 'warning' 
                    : 'success'
              "
            >
              {{ 
                currentAlert.status === 'unresolved' 
                  ? '未处理' 
                  : currentAlert.status === 'acknowledged' 
                    ? '已确认' 
                    : '已解决' 
              }}
            </el-tag>
          </span>
        </div>
        <div v-if="currentAlert.resolvedBy" class="detail-item">
          <span class="detail-label">处理人:</span>
          <span class="detail-value">{{ currentAlert.resolvedBy }}</span>
        </div>
        <div v-if="currentAlert.resolvedAt" class="detail-item">
          <span class="detail-label">处理时间:</span>
          <span class="detail-value">{{ currentAlert.resolvedAt }}</span>
        </div>
        <div v-if="currentAlert.resolution" class="detail-item">
          <span class="detail-label">解决方案:</span>
          <span class="detail-value">{{ currentAlert.resolution }}</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button 
            v-if="currentAlert && currentAlert.status === 'unresolved'"
            type="primary" 
            @click="handleAcknowledge(currentAlert)"
          >确认</el-button>
          <el-button 
            v-if="currentAlert && currentAlert.status !== 'resolved'"
            type="success" 
            @click="handleResolve(currentAlert)"
          >解决</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 解决告警对话框 -->
    <el-dialog
      v-model="resolveDialogVisible"
      title="解决告警"
      width="500px"
    >
      <el-form :model="resolveForm" label-width="100px">
        <el-form-item label="解决方案">
          <el-input
            v-model="resolveForm.resolution"
            type="textarea"
            rows="4"
            placeholder="请输入解决方案"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resolveDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmResolve">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索条件
const searchKeyword = ref('')
const severityFilter = ref('')
const statusFilter = ref('')
const dateRange = ref([])

// 列表数据
const loading = ref(false)
const alertList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedAlerts = ref([])

// 详情对话框
const detailDialogVisible = ref(false)
const currentAlert = ref(null)

// 解决告警对话框
const resolveDialogVisible = ref(false)
const resolveForm = reactive({
  id: '',
  resolution: ''
})

// 获取告警列表
const getAlertList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    // 生成模拟数据
    const mockAlerts = Array(30).fill(0).map((_, index) => ({
      id: `ALT${String(index + 1).padStart(4, '0')}`,
      deviceId: `DEV${String(Math.floor(Math.random() * 10) + 1).padStart(3, '0')}`,
      deviceName: `设备${Math.floor(Math.random() * 10) + 1}`,
      severity: ['critical', 'warning', 'info'][Math.floor(Math.random() * 3)],
      message: [
        '设备温度超过阈值',
        '设备离线',
        '电池电量低',
        '网络连接异常',
        '传感器数据异常'
      ][Math.floor(Math.random() * 5)],
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toLocaleString(),
      status: ['unresolved', 'acknowledged', 'resolved'][Math.floor(Math.random() * 3)],
      resolvedBy: null,
      resolvedAt: null,
      resolution: null
    }))
    
    // 为一些已解决的告警添加解决信息
    mockAlerts.forEach(alert => {
      if (alert.status === 'resolved') {
        alert.resolvedBy = '管理员'
        alert.resolvedAt = new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toLocaleString()
        alert.resolution = '重启设备后恢复正常'
      }
    })
    
    // 过滤
    let filteredAlerts = [...mockAlerts]
    
    if (searchKeyword.value) {
      filteredAlerts = filteredAlerts.filter(
        alert => alert.deviceName.includes(searchKeyword.value) || 
                alert.deviceId.includes(searchKeyword.value) ||
                alert.id.includes(searchKeyword.value)
      )
    }
    
    if (severityFilter.value) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severityFilter.value)
    }
    
    if (statusFilter.value) {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === statusFilter.value)
    }
    
    if (dateRange.value && dateRange.value.length === 2) {
      const startDate = new Date(dateRange.value[0])
      const endDate = new Date(dateRange.value[1])
      endDate.setHours(23, 59, 59, 999) // 设置为当天结束时间
      
      filteredAlerts = filteredAlerts.filter(alert => {
        const alertDate = new Date(alert.timestamp)
        return alertDate >= startDate && alertDate <= endDate
      })
    }
    
    // 分页
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    
    // 排序：未处理的优先显示
    filteredAlerts.sort((a, b) => {
      if (a.status === 'unresolved' && b.status !== 'unresolved') return -1
      if (a.status !== 'unresolved' && b.status === 'unresolved') return 1
      return new Date(b.timestamp) - new Date(a.timestamp) // 时间倒序
    })
    
    alertList.value = filteredAlerts.slice(start, end)
    total.value = filteredAlerts.length
    
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getAlertList()
}

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = ''
  severityFilter.value = ''
  statusFilter.value = ''
  dateRange.value = []
  currentPage.value = 1
  getAlertList()
}

// 刷新告警
const refreshAlerts = () => {
  getAlertList()
}

// 分页变化
const handleSizeChange = (val) => {
  pageSize.value = val
  getAlertList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getAlertList()
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedAlerts.value = selection
}

// 查看详情
const handleDetail = (row) => {
  currentAlert.value = { ...row }
  detailDialogVisible.value = true
}

// 确认告警
const handleAcknowledge = (row) => {
  // 模拟API请求
  setTimeout(() => {
    // 更新本地数据
    if (row === currentAlert.value) {
      currentAlert.value.status = 'acknowledged'
    }
    
    const index = alertList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      alertList.value[index].status = 'acknowledged'
    }
    
    ElMessage.success('告警已确认')
  }, 300)
}

// 解决告警对话框
const handleResolve = (row) => {
  resolveForm.id = row.id
  resolveForm.resolution = ''
  resolveDialogVisible.value = true
}

// 确认解决
const confirmResolve = () => {
  // 模拟API请求
  setTimeout(() => {
    // 更新本地数据
    const resolvedAlert = {
      resolvedBy: '管理员',
      resolvedAt: new Date().toLocaleString(),
      resolution: resolveForm.resolution,
      status: 'resolved'
    }
    
    // 更新列表中的数据
    const index = alertList.value.findIndex(item => item.id === resolveForm.id)
    if (index !== -1) {
      Object.assign(alertList.value[index], resolvedAlert)
    }
    
    // 如果当前告警详情对话框打开，也更新它
    if (currentAlert.value && currentAlert.value.id === resolveForm.id) {
      Object.assign(currentAlert.value, resolvedAlert)
    }
    
    resolveDialogVisible.value = false
    ElMessage.success('告警已解决')
  }, 300)
}

// 批量清除
const batchClear = () => {
  if (selectedAlerts.value.length === 0) return
  
  ElMessageBox.confirm(
    `确认清除选中的 ${selectedAlerts.value.length} 条告警?`,
    '批量清除',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 模拟API请求
      setTimeout(() => {
        // 更新本地数据
        const ids = selectedAlerts.value.map(item => item.id)
        
        alertList.value = alertList.value.filter(item => !ids.includes(item.id))
        
        ElMessage.success(`已清除 ${ids.length} 条告警`)
        selectedAlerts.value = []
      }, 300)
    })
    .catch(() => {
      // 用户取消操作
    })
}

onMounted(() => {
  getAlertList()
})
</script>

<style scoped>
.alerts-container {
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

.detail-item {
  margin-bottom: 15px;
  display: flex;
}

.detail-label {
  width: 100px;
  color: #606266;
}

.detail-value {
  flex: 1;
  word-break: break-all;
}
</style> 