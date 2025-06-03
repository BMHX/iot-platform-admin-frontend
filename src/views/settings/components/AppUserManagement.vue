<template>
  <div class="app-user-management">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAddUser">添加用户</el-button>
      <el-button type="danger" :disabled="selectedUsers.length === 0" @click="handleBatchDelete">批量删除</el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-container">
      <el-input
        v-model="searchQuery"
        placeholder="用户名/手机号/邮箱"
        style="width: 200px; margin-right: 10px"
        clearable
      />
      <el-select
        v-model="userTypeFilter"
        placeholder="用户类型"
        style="width: 130px; margin-right: 10px"
        clearable
      >
        <el-option label="个人用户" value="personal" />
        <el-option label="企业用户" value="enterprise" />
      </el-select>
      <el-select
        v-model="statusFilter"
        placeholder="状态"
        style="width: 130px; margin-right: 10px"
        clearable
      >
        <el-option label="正常" value="active" />
        <el-option label="禁用" value="disabled" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <!-- 用户列表 -->
    <el-table
      :data="userList"
      border
      style="width: 100%"
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="nickname" label="昵称" width="120" />
      <el-table-column prop="userType" label="用户类型" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.userType === 'personal' ? 'success' : 'primary'">
            {{ scope.row.userType === 'personal' ? '个人用户' : '企业用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="email" label="邮箱" width="180" />
      <el-table-column prop="deviceCount" label="绑定设备数" width="120" />
      <el-table-column prop="registerTime" label="注册时间" width="180" />
      <el-table-column prop="lastLoginTime" label="最后登录时间" width="180" />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="'active'"
            :inactive-value="'disabled'"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
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

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加App用户' : '编辑App用户'"
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
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userForm.nickname" />
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-radio-group v-model="userForm.userType">
            <el-radio label="personal">个人用户</el-radio>
            <el-radio label="enterprise">企业用户</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio label="active">正常</el-radio>
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
          <el-button type="primary" @click="submitUserForm">确定</el-button>
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
        <el-form-item label="用户名">
          <span>{{ resetPwdForm.username }}</span>
        </el-form-item>
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
          <el-button type="primary" @click="submitResetPwd">确定</el-button>
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
const selectedUsers = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 搜索和筛选
const searchQuery = ref('')
const userTypeFilter = ref('')
const statusFilter = ref('')

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add') // add 或 edit
const userFormRef = ref(null)
const userForm = reactive({
  id: '',
  username: '',
  nickname: '',
  userType: 'personal',
  email: '',
  phone: '',
  status: 'active',
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
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  userType: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
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

// 获取用户列表
const getUserList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    // 模拟数据
    const mockUsers = [
      {
        id: 1,
        username: 'user001',
        nickname: '张三',
        userType: 'personal',
        email: 'user001@example.com',
        phone: '13800138001',
        deviceCount: 3,
        status: 'active',
        registerTime: '2023-05-15 10:30:00',
        lastLoginTime: '2023-06-20 09:15:23'
      },
      {
        id: 2,
        username: 'user002',
        nickname: '李四',
        userType: 'personal',
        email: 'user002@example.com',
        phone: '13800138002',
        deviceCount: 2,
        status: 'active',
        registerTime: '2023-05-20 14:20:00',
        lastLoginTime: '2023-06-19 15:30:45'
      },
      {
        id: 3,
        username: 'enterprise001',
        nickname: '智能科技有限公司',
        userType: 'enterprise',
        email: 'contact@enterprise.com',
        phone: '13800138003',
        deviceCount: 15,
        status: 'active',
        registerTime: '2023-04-10 09:15:00',
        lastLoginTime: '2023-06-20 10:05:18'
      },
      {
        id: 4,
        username: 'user003',
        nickname: '王五',
        userType: 'personal',
        email: 'user003@example.com',
        phone: '13800138004',
        deviceCount: 1,
        status: 'disabled',
        registerTime: '2023-06-01 16:25:00',
        lastLoginTime: '2023-06-05 18:40:22'
      },
      {
        id: 5,
        username: 'enterprise002',
        nickname: '物联网科技公司',
        userType: 'enterprise',
        email: 'contact@iot-tech.com',
        phone: '13800138005',
        deviceCount: 8,
        status: 'active',
        registerTime: '2023-04-25 11:20:00',
        lastLoginTime: '2023-06-18 11:35:40'
      }
    ]
    
    // 过滤
    let filteredUsers = [...mockUsers]
    
    if (searchQuery.value) {
      filteredUsers = filteredUsers.filter(u => 
        u.username.includes(searchQuery.value) || 
        u.nickname.includes(searchQuery.value) || 
        u.email.includes(searchQuery.value) || 
        u.phone.includes(searchQuery.value)
      )
    }
    
    if (userTypeFilter.value) {
      filteredUsers = filteredUsers.filter(u => u.userType === userTypeFilter.value)
    }
    
    if (statusFilter.value) {
      filteredUsers = filteredUsers.filter(u => u.status === statusFilter.value)
    }
    
    // 分页
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    userList.value = filteredUsers.slice(start, end)
    total.value = filteredUsers.length
    
    loading.value = false
  }, 500)
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getUserList()
}

// 重置搜索
const resetSearch = () => {
  searchQuery.value = ''
  userTypeFilter.value = ''
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
const handleAddUser = () => {
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
    nickname: row.nickname,
    userType: row.userType,
    email: row.email,
    phone: row.phone,
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

// 批量删除
const handleBatchDelete = () => {
  if (selectedUsers.value.length === 0) return
  
  ElMessageBox.confirm(
    `确认删除选中的 ${selectedUsers.value.length} 个用户?`,
    '批量删除确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 模拟API请求
      setTimeout(() => {
        // 删除选中用户
        const ids = selectedUsers.value.map(u => u.id)
        userList.value = userList.value.filter(u => !ids.includes(u.id))
        total.value -= selectedUsers.value.length
        selectedUsers.value = []
        ElMessage.success('选中用户已删除')
      }, 300)
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 修改状态
const handleStatusChange = (row) => {
  const statusText = row.status === 'active' ? '启用' : '禁用'
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
    nickname: '',
    userType: 'personal',
    email: '',
    phone: '',
    status: 'active',
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
          id: Date.now(),
          username: userForm.username,
          nickname: userForm.nickname,
          userType: userForm.userType,
          email: userForm.email,
          phone: userForm.phone,
          deviceCount: 0,
          status: userForm.status,
          registerTime: new Date().toLocaleString(),
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
            nickname: userForm.nickname,
            userType: userForm.userType,
            email: userForm.email,
            phone: userForm.phone,
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
.app-user-management {
  width: 100%;
}

.operation-bar {
  margin-bottom: 20px;
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