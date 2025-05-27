<template>
  <div class="users-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="showAddUserDialog">添加用户</el-button>
        </div>
      </template>

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
          placeholder="用户角色"
          style="width: 130px; margin-right: 10px"
          clearable
        >
          <el-option label="管理员" value="admin" />
          <el-option label="操作员" value="operator" />
          <el-option label="访客" value="visitor" />
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
      <el-table :data="userList" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column label="角色" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.role === 'admin' ? 'danger' : scope.row.role === 'operator' ? 'primary' : 'info'"
            >
              {{ scope.row.role === 'admin' ? '管理员' : scope.row.role === 'operator' ? '操作员' : '访客' }}
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
        <el-table-column prop="lastLoginTime" label="最后登录时间" width="180" />
        <el-table-column label="操作">
          <template #default="scope">
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
            <el-button
              size="small"
              @click="handleResetPassword(scope.row)"
            >重置密码</el-button>
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

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      width="500px"
    >
      <el-form
        :model="userForm"
        label-width="100px"
        :rules="rules"
        ref="userFormRef"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="操作员" value="operator" />
            <el-option label="访客" value="visitor" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="dialogType === 'add'" label="密码" prop="password">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item v-if="dialogType === 'add'" label="确认密码" prop="confirmPassword">
          <el-input v-model="userForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUserForm">确认</el-button>
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
const userList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add') // add 或 edit
const userFormRef = ref(null)
const userForm = reactive({
  id: '',
  username: '',
  name: '',
  email: '',
  phone: '',
  role: '',
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
const currentUser = ref(null)

// 表单验证规则
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (userForm.confirmPassword !== '') {
      userFormRef.value.validateField('confirmPassword')
    }
    callback()
  }
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== userForm.password) {
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
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
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

// 获取用户列表
const getUserList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    // 模拟数据
    const mockUsers = Array(15).fill(0).map((_, index) => ({
      id: index + 1,
      username: `user${index + 1}`,
      name: `用户${index + 1}`,
      email: `user${index + 1}@example.com`,
      phone: `1381234${String(index + 1).padStart(4, '0')}`,
      role: ['admin', 'operator', 'visitor'][Math.floor(Math.random() * 3)],
      status: Math.random() > 0.2 ? 'enabled' : 'disabled',
      lastLoginTime: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toLocaleString()
    }))
    
    // 过滤
    let filteredUsers = [...mockUsers]
    if (searchQuery.value) {
      filteredUsers = filteredUsers.filter(
        user => user.username.includes(searchQuery.value) || 
                user.name.includes(searchQuery.value) || 
                user.email.includes(searchQuery.value)
      )
    }
    if (roleFilter.value) {
      filteredUsers = filteredUsers.filter(user => user.role === roleFilter.value)
    }
    if (statusFilter.value) {
      filteredUsers = filteredUsers.filter(user => user.status === statusFilter.value)
    }
    
    // 分页
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    userList.value = filteredUsers.slice(start, end)
    total.value = filteredUsers.length
    
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getUserList()
}

// 重置搜索
const resetSearch = () => {
  searchQuery.value = ''
  roleFilter.value = ''
  statusFilter.value = ''
  currentPage.value = 1
  getUserList()
}

// 分页变化
const handleSizeChange = (val) => {
  pageSize.value = val
  getUserList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getUserList()
}

// 添加用户
const showAddUserDialog = () => {
  dialogType.value = 'add'
  resetUserForm()
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row) => {
  dialogType.value = 'edit'
  // 填充表单
  Object.assign(userForm, {
    id: row.id,
    username: row.username,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    status: row.status
  })
  dialogVisible.value = true
}

// 删除用户
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确认删除用户 ${row.username}?`,
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
        const index = userList.value.findIndex(item => item.id === row.id)
        if (index !== -1) {
          userList.value.splice(index, 1)
          total.value--
        }
        ElMessage.success('用户已删除')
      }, 300)
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 修改状态
const handleStatusChange = (row) => {
  const statusText = row.status === 'enabled' ? '启用' : '禁用'
  ElMessage.success(`用户 ${row.username} 已${statusText}`)
}

// 重置密码
const handleResetPassword = (row) => {
  currentUser.value = row
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
        ElMessage.success(`用户 ${currentUser.value.username} 密码重置成功`)
        resetPwdVisible.value = false
      }, 300)
    }
  })
}

// 重置表单
const resetUserForm = () => {
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
  Object.assign(userForm, {
    id: '',
    username: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    status: 'enabled',
    password: '',
    confirmPassword: ''
  })
}

// 提交表单
const submitUserForm = () => {
  if (!userFormRef.value) return
  
  userFormRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 添加用户
        const newUser = {
          id: total.value + 1,
          username: userForm.username,
          name: userForm.name,
          email: userForm.email,
          phone: userForm.phone,
          role: userForm.role,
          status: userForm.status,
          lastLoginTime: '-'
        }
        userList.value.unshift(newUser)
        total.value++
        ElMessage.success('用户添加成功')
      } else {
        // 编辑用户
        const index = userList.value.findIndex(item => item.id === userForm.id)
        if (index !== -1) {
          Object.assign(userList.value[index], {
            name: userForm.name,
            email: userForm.email,
            phone: userForm.phone,
            role: userForm.role,
            status: userForm.status
          })
        }
        ElMessage.success('用户更新成功')
      }
      
      dialogVisible.value = false
    }
  })
}

onMounted(() => {
  getUserList()
})
</script>

<style scoped>
.users-container {
  padding: 20px;
  width: 100%;
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