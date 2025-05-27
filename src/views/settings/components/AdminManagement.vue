<template>
  <div class="admin-management">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAddAdmin">添加管理员</el-button>
      <el-button type="danger" :disabled="selectedAdmins.length === 0" @click="handleBatchDelete">批量删除</el-button>
    </div>

    <!-- 管理员列表 -->
    <el-table
      :data="adminList"
      border
      style="width: 100%"
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="role" label="角色" width="120">
        <template #default="scope">
          <el-tag type="danger">{{ scope.row.role }}</el-tag>
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
      width="500px"
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
          <el-select v-model="adminForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="超级管理员" value="超级管理员" />
            <el-option label="系统管理员" value="系统管理员" />
            <el-option label="安全管理员" value="安全管理员" />
          </el-select>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 列表数据
const loading = ref(false)
const adminList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedAdmins = ref([])

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add') // add 或 edit
const adminFormRef = ref(null)
const adminForm = reactive({
  id: '',
  username: '',
  name: '',
  role: '',
  email: '',
  phone: '',
  status: 'enabled',
  password: '',
  confirmPassword: ''
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

const validateResetPass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
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
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
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
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateResetPass2, trigger: 'blur' }
  ]
}

// 获取管理员列表
const getAdminList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    // 模拟数据
    const mockAdmins = [
      {
        id: 1,
        username: 'admin',
        name: '超级管理员',
        role: '超级管理员',
        email: 'admin@example.com',
        phone: '13800000000',
        status: 'enabled',
        lastLoginTime: new Date().toLocaleString()
      },
      {
        id: 2,
        username: 'system',
        name: '系统管理员',
        role: '系统管理员',
        email: 'system@example.com',
        phone: '13800000001',
        status: 'enabled',
        lastLoginTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleString()
      },
      {
        id: 3,
        username: 'security',
        name: '安全管理员',
        role: '安全管理员',
        email: 'security@example.com',
        phone: '13800000002',
        status: 'disabled',
        lastLoginTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleString()
      }
    ]
    
    // 分页
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    adminList.value = mockAdmins.slice(start, end)
    total.value = mockAdmins.length
    
    loading.value = false
  }, 500)
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedAdmins.value = selection
}

// 分页变化
const handleSizeChange = (val) => {
  pageSize.value = val
  getAdminList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getAdminList()
}

// 添加管理员
const handleAddAdmin = () => {
  dialogType.value = 'add'
  resetAdminForm()
  dialogVisible.value = true
}

// 编辑管理员
const handleEdit = (row) => {
  dialogType.value = 'edit'
  // 填充表单
  Object.assign(adminForm, {
    id: row.id,
    username: row.username,
    name: row.name,
    role: row.role,
    email: row.email,
    phone: row.phone,
    status: row.status
  })
  dialogVisible.value = true
}

// 删除管理员
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确认删除管理员 ${row.username}?`,
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
        const index = adminList.value.findIndex(item => item.id === row.id)
        if (index !== -1) {
          adminList.value.splice(index, 1)
          total.value--
        }
        ElMessage.success('管理员已删除')
      }, 300)
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedAdmins.value.length === 0) return
  
  ElMessageBox.confirm(
    `确认删除选中的 ${selectedAdmins.value.length} 个管理员?`,
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
        const ids = selectedAdmins.value.map(item => item.id)
        adminList.value = adminList.value.filter(item => !ids.includes(item.id))
        total.value -= ids.length
        
        ElMessage.success(`已删除 ${ids.length} 个管理员`)
        selectedAdmins.value = []
      }, 300)
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 修改状态
const handleStatusChange = (row) => {
  const statusText = row.status === 'enabled' ? '启用' : '禁用'
  ElMessage.success(`管理员 ${row.username} 已${statusText}`)
}

// 重置密码
const handleResetPassword = (row) => {
  currentAdmin.value = row
  resetPwdForm.userId = row.id
  resetPwdForm.username = row.username
  resetPwdForm.password = ''
  resetPwdForm.confirmPassword = ''
  resetPwdVisible.value = true
}

// 提交重置密码
const submitResetPwd = () => {
  if (!resetPwdFormRef.value) return
  
  resetPwdFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟API请求
      setTimeout(() => {
        ElMessage.success(`管理员 ${currentAdmin.value.username} 密码重置成功`)
        resetPwdVisible.value = false
      }, 300)
    }
  })
}

// 重置表单
const resetAdminForm = () => {
  if (adminFormRef.value) {
    adminFormRef.value.resetFields()
  }
  Object.assign(adminForm, {
    id: '',
    username: '',
    name: '',
    role: '',
    email: '',
    phone: '',
    status: 'enabled',
    password: '',
    confirmPassword: ''
  })
}

// 提交表单
const submitAdminForm = () => {
  if (!adminFormRef.value) return
  
  adminFormRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 添加管理员
        const newAdmin = {
          id: total.value + 1,
          username: adminForm.username,
          name: adminForm.name,
          role: adminForm.role,
          email: adminForm.email,
          phone: adminForm.phone,
          status: adminForm.status,
          lastLoginTime: '-'
        }
        adminList.value.unshift(newAdmin)
        total.value++
        ElMessage.success('管理员添加成功')
      } else {
        // 编辑管理员
        const index = adminList.value.findIndex(item => item.id === adminForm.id)
        if (index !== -1) {
          Object.assign(adminList.value[index], {
            name: adminForm.name,
            role: adminForm.role,
            email: adminForm.email,
            phone: adminForm.phone,
            status: adminForm.status
          })
        }
        ElMessage.success('管理员更新成功')
      }
      
      dialogVisible.value = false
    }
  })
}

onMounted(() => {
  getAdminList()
})
</script>

<style scoped>
.admin-management {
  width: 100%;
}

.operation-bar {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 