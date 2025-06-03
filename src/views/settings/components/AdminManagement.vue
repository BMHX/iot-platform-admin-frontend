<template>
  <div class="admin-management">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAddAdmin">添加管理员</el-button>
      <el-button type="danger" :disabled="selectedAdmins.length === 0" @click="handleBatchDelete">批量删除</el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-container">
      <el-input
        v-model="searchQuery"
        placeholder="用户名/姓名/邮箱"
        style="width: 200px; margin-right: 10px"
        clearable
      />
      <el-select
        v-model="roleFilter"
        placeholder="角色"
        style="width: 150px; margin-right: 10px"
        clearable
      >
        <el-option label="超级管理员" value="超级管理员" />
        <el-option label="系统管理员" value="系统管理员" />
        <el-option label="租户管理员" value="租户管理员" />
        <el-option label="数据查看员" value="数据查看员" />
      </el-select>
      <el-select
        v-model="tenantTypeFilter"
        placeholder="租户类型"
        style="width: 150px; margin-right: 10px"
        clearable
      >
        <el-option label="平台级" value="platform" />
        <el-option label="学校" value="school" />
        <el-option label="小区" value="community" />
        <el-option label="驿站" value="station" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <!-- 管理员列表 -->
    <el-table
      :data="adminList"
      border
      style="width: 100%; margin-top: 15px"
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="role" label="角色" width="120">
        <template #default="scope">
          <el-tag 
            :type="scope.row.role === '超级管理员' ? 'danger' : 
                  scope.row.role === '系统管理员' ? 'warning' : 
                  scope.row.role === '租户管理员' ? 'success' : 'info'"
          >
            {{ scope.row.role }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="tenantType" label="管理范围" width="100">
        <template #default="scope">
          <el-tag 
            :type="scope.row.tenantType === 'platform' ? 'danger' : 
                  scope.row.tenantType === 'school' ? 'success' : 
                  scope.row.tenantType === 'community' ? 'warning' : 'info'"
          >
            {{ scope.row.tenantType === 'platform' ? '平台级' : 
               scope.row.tenantType === 'school' ? '学校' : 
               scope.row.tenantType === 'community' ? '小区' : '驿站' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱" width="180" />
      <el-table-column prop="phone" label="手机号" width="130" />
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
      <el-table-column prop="lastLoginTime" label="最后登录时间" width="180" />
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <el-button size="small" @click="handleResetPassword(scope.row)">重置密码</el-button>
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

    <!-- 添加/编辑管理员对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加管理员' : '编辑管理员'"
      width="600px"
    >
      <el-form
        :model="adminForm"
        label-width="100px"
        :rules="rules"
        ref="adminFormRef"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="adminForm.username" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="adminForm.name" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="adminForm.role" placeholder="请选择角色" style="width: 100%" @change="handleRoleChange">
            <el-option label="超级管理员" value="超级管理员" />
            <el-option label="系统管理员" value="系统管理员" />
            <el-option label="租户管理员" value="租户管理员" />
            <el-option label="数据查看员" value="数据查看员" />
          </el-select>
        </el-form-item>
        <el-form-item label="管理范围" prop="tenantType">
          <el-select v-model="adminForm.tenantType" placeholder="请选择管理范围" style="width: 100%" @change="handleTenantTypeChange">
            <el-option label="平台级" value="platform" :disabled="!isPlatformRole" />
            <el-option label="学校" value="school" :disabled="isPlatformRole" />
            <el-option label="小区" value="community" :disabled="isPlatformRole" />
            <el-option label="驿站" value="station" :disabled="isPlatformRole" />
          </el-select>
        </el-form-item>
        <el-form-item label="租户选择" prop="tenantIds" v-if="adminForm.tenantType !== 'platform'">
          <el-select v-model="adminForm.tenantIds" multiple placeholder="请选择具体租户" style="width: 100%">
            <el-option-group v-if="adminForm.tenantType === 'school'" label="学校">
              <el-option 
                v-for="item in schoolOptions" 
                :key="item.value" 
                :label="item.label" 
                :value="item.value" 
              />
            </el-option-group>
            <el-option-group v-if="adminForm.tenantType === 'community'" label="小区">
              <el-option 
                v-for="item in communityOptions" 
                :key="item.value" 
                :label="item.label" 
                :value="item.value" 
              />
            </el-option-group>
            <el-option-group v-if="adminForm.tenantType === 'station'" label="驿站">
              <el-option 
                v-for="item in stationOptions" 
                :key="item.value" 
                :label="item.label" 
                :value="item.value" 
              />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="权限" prop="permissionIds">
          <el-transfer
            v-model="adminForm.permissionIds"
            :data="permissionOptions"
            :titles="['可选权限', '已选权限']"
            :props="{
              key: 'id',
              label: 'name'
            }"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="adminForm.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="adminForm.phone" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="adminForm.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="dialogType === 'add'" label="密码" prop="password">
          <el-input v-model="adminForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item v-if="dialogType === 'add'" label="确认密码" prop="confirmPassword">
          <el-input v-model="adminForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAdminForm">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetPwdVisible"
      title="重置密码"
      width="400px"
    >
      <el-form
        :model="resetPwdForm"
        label-width="100px"
        :rules="resetPwdRules"
        ref="resetPwdFormRef"
      >
        <el-form-item label="新密码" prop="password">
          <el-input v-model="resetPwdForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="resetPwdForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetPwdVisible = false">取消</el-button>
          <el-button type="primary" @click="submitResetPwd">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 列表数据
const loading = ref(false)
const adminList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedAdmins = ref([])
const searchQuery = ref('')
const roleFilter = ref('')
const tenantTypeFilter = ref('')

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add') // add 或 edit
const adminFormRef = ref(null)
const adminForm = reactive({
  id: '',
  username: '',
  name: '',
  role: '',
  tenantType: '',
  tenantIds: [],
  permissionIds: [],
  email: '',
  phone: '',
  status: 'enabled',
  password: '',
  confirmPassword: ''
})

// 是否为平台级角色
const isPlatformRole = computed(() => {
  return ['超级管理员', '系统管理员'].includes(adminForm.role)
})

// 重置密码对话框
const resetPwdVisible = ref(false)
const resetPwdFormRef = ref(null)
const resetPwdForm = reactive({
  userId: '',
  username: '',
  password: '',
  confirmPassword: ''
})
const currentAdmin = ref(null)

// 租户选项
const schoolOptions = ref([
  { value: '1', label: '第一中学' },
  { value: '2', label: '第二中学' },
  { value: '3', label: '实验中学' }
])
const communityOptions = ref([
  { value: '4', label: '阳光小区' },
  { value: '5', label: '和谐花园' },
  { value: '6', label: '幸福家园' }
])
const stationOptions = ref([
  { value: '7', label: '中央驿站' },
  { value: '8', label: '东部驿站' },
  { value: '9', label: '西部驿站' }
])

// 权限选项
const permissionOptions = ref([
  { id: '1', name: '系统管理-查看' },
  { id: '2', name: '系统管理-编辑' },
  { id: '3', name: '系统管理-删除' },
  { id: '4', name: '租户管理-查看' },
  { id: '5', name: '租户管理-编辑' },
  { id: '6', name: '租户管理-删除' },
  { id: '7', name: '设备管理-查看' },
  { id: '8', name: '设备管理-编辑' },
  { id: '9', name: '设备管理-删除' },
  { id: '10', name: '数据分析-查看' },
  { id: '11', name: '告警管理-查看' },
  { id: '12', name: '告警管理-处理' },
  { id: '13', name: '统计管理-查看' },
  { id: '14', name: '统计管理-导出' },
  { id: '15', name: 'App管理-查看' },
  { id: '16', name: 'App管理-编辑' }
])

// 表单验证规则
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (adminForm.confirmPassword !== '') {
      adminFormRef.value.validateField('confirmPassword')
    }
    callback()
  }
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== adminForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const validateResetPass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入新密码'))
  } else {
    if (resetPwdForm.confirmPassword !== '') {
      resetPwdFormRef.value.validateField('confirmPassword')
    }
    callback()
  }
}

const validateResetPass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== resetPwdForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  tenantType: [
    { required: true, message: '请选择管理范围', trigger: 'change' }
  ],
  tenantIds: [
    { required: true, message: '请选择具体租户', trigger: 'change', type: 'array' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  password: [
    { validator: validatePass, trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validatePass2, trigger: 'blur' }
  ]
}

const resetPwdRules = {
  password: [
    { validator: validateResetPass, trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateResetPass2, trigger: 'blur' }
  ]
}

// 获取管理员列表
const fetchAdminList = () => {
  loading.value = true
  // 这里应该调用API获取数据
  // 模拟数据
  setTimeout(() => {
    adminList.value = [
      {
        id: 1,
        username: 'admin',
        name: '系统管理员',
        role: '超级管理员',
        tenantType: 'platform',
        email: 'admin@example.com',
        phone: '13800138000',
        status: 'enabled',
        lastLoginTime: '2023-05-27 10:30:00',
        permissionIds: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16']
      },
      {
        id: 2,
        username: 'operator',
        name: '运维人员',
        role: '系统管理员',
        tenantType: 'platform',
        email: 'operator@example.com',
        phone: '13800138001',
        status: 'enabled',
        lastLoginTime: '2023-05-26 16:45:00',
        permissionIds: ['1', '4', '7', '10', '11', '13', '15']
      },
      {
        id: 3,
        username: 'school_admin',
        name: '学校管理员',
        role: '租户管理员',
        tenantType: 'school',
        tenantIds: ['1', '2'],
        email: 'school@example.com',
        phone: '13800138002',
        status: 'enabled',
        lastLoginTime: '2023-05-25 09:15:00',
        permissionIds: ['4', '7', '10', '11', '13']
      },
      {
        id: 4,
        username: 'community_admin',
        name: '小区管理员',
        role: '租户管理员',
        tenantType: 'community',
        tenantIds: ['4'],
        email: 'community@example.com',
        phone: '13800138003',
        status: 'enabled',
        lastLoginTime: '2023-05-24 14:20:00',
        permissionIds: ['4', '7', '10', '11', '13']
      },
      {
        id: 5,
        username: 'viewer',
        name: '数据查看员',
        role: '数据查看员',
        tenantType: 'station',
        tenantIds: ['7', '8', '9'],
        email: 'viewer@example.com',
        phone: '13800138004',
        status: 'enabled',
        lastLoginTime: '2023-05-23 11:30:00',
        permissionIds: ['1', '4', '7', '10', '11', '13']
      }
    ]
    total.value = 5
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchAdminList()
}

// 重置搜索
const resetSearch = () => {
  searchQuery.value = ''
  roleFilter.value = ''
  tenantTypeFilter.value = ''
  currentPage.value = 1
  fetchAdminList()
}

// 分页
const handleSizeChange = (size) => {
  pageSize.value = size
  fetchAdminList()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchAdminList()
}

// 表格选择
const handleSelectionChange = (selection) => {
  selectedAdmins.value = selection
}

// 添加管理员
const handleAddAdmin = () => {
  dialogType.value = 'add'
  Object.assign(adminForm, {
    id: '',
    username: '',
    name: '',
    role: '',
    tenantType: '',
    tenantIds: [],
    permissionIds: [],
    email: '',
    phone: '',
    status: 'enabled',
    password: '',
    confirmPassword: ''
  })
  dialogVisible.value = true
}

// 角色变更
const handleRoleChange = (value) => {
  if (['超级管理员', '系统管理员'].includes(value)) {
    adminForm.tenantType = 'platform'
    adminForm.tenantIds = []
  } else if (adminForm.tenantType === 'platform') {
    adminForm.tenantType = ''
  }
}

// 租户类型变更
const handleTenantTypeChange = (value) => {
  adminForm.tenantIds = []
}

// 编辑管理员
const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(adminForm, { ...row })
  dialogVisible.value = true
}

// 删除管理员
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除管理员 ${row.username} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 这里应该调用API删除数据
    adminList.value = adminList.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedAdmins.value.length === 0) {
    return
  }
  
  const names = selectedAdmins.value.map(item => item.username).join('、')
  const ids = selectedAdmins.value.map(item => item.id)
  
  ElMessageBox.confirm(`确定要删除以下管理员吗？\n${names}`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 这里应该调用API删除数据
    adminList.value = adminList.value.filter(item => !ids.includes(item.id))
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

// 状态变更
const handleStatusChange = (row) => {
  const statusText = row.status === 'enabled' ? '启用' : '禁用'
  ElMessage.success(`已${statusText}管理员 ${row.username}`)
}

// 重置密码
const handleResetPassword = (row) => {
  resetPwdForm.userId = row.id
  resetPwdForm.username = row.username
  resetPwdForm.password = ''
  resetPwdForm.confirmPassword = ''
  resetPwdVisible.value = true
  currentAdmin.value = row
}

// 提交管理员表单
const submitAdminForm = () => {
  adminFormRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 添加管理员
        const newAdmin = {
          id: Date.now(),
          ...adminForm,
          lastLoginTime: '-'
        }
        adminList.value.unshift(newAdmin)
        ElMessage.success('添加管理员成功')
      } else {
        // 编辑管理员
        const index = adminList.value.findIndex(item => item.id === adminForm.id)
        if (index !== -1) {
          adminList.value[index] = { ...adminList.value[index], ...adminForm }
        }
        ElMessage.success('编辑管理员成功')
      }
      dialogVisible.value = false
    } else {
      return false
    }
  })
}

// 提交重置密码
const submitResetPwd = () => {
  resetPwdFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(`已重置 ${resetPwdForm.username} 的密码`)
      resetPwdVisible.value = false
    } else {
      return false
    }
  })
}

onMounted(() => {
  fetchAdminList()
})
</script>

<style scoped>
.admin-management {
  width: 100%;
}

.operation-bar {
  margin-bottom: 15px;
}

.filter-container {
  margin-bottom: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-transfer) {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:deep(.el-transfer__buttons) {
  padding: 0 10px;
}

:deep(.el-transfer-panel) {
  width: 40%;
}

:deep(.el-transfer-panel__body) {
  height: 300px;
}
</style> 