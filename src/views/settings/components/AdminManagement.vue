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
      <el-table-column prop="name" label="姓名" width="120">
        <template #default="scope">
          {{ scope.row.name || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="identity" label="角色" width="120">
        <template #default="scope">
          <el-tag 
            :type="scope.row.identity === '超级管理员' ? 'danger' : 
                  scope.row.identity === '系统管理员' ? 'warning' : 
                  scope.row.identity === '租户管理员' ? 'success' : 'info'"
          >
            {{ scope.row.identity || '-' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="permissionId" label="权限套餐" width="120">
        <template #default="scope">
          {{ getPermissionPackageName(scope.row.permissionId) }}
        </template>
      </el-table-column>
      <el-table-column prop="dueTime" label="套餐到期时间" width="180">
        <template #default="scope">
          {{ formatDueTime(scope.row.dueTime) || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱" width="180">
        <template #default="scope">
          {{ scope.row.email || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" width="130">
        <template #default="scope">
          {{ scope.row.phone || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="'enabled'"
            :inactive-value="'disabled'"
            @change="() => handleStatusChange(scope.row)"
            :disabled="!scope.row.hasOwnProperty('status')"
          />
        </template>
      </el-table-column>
      <el-table-column prop="lastLoginTime" label="最后登录时间" width="180">
        <template #default="scope">
          {{ scope.row.lastLoginTime || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
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
        <el-form-item label="权限套餐" prop="permissionId">
          <el-select v-model="adminForm.permissionId" placeholder="请选择权限套餐" style="width: 100%">
            <el-option 
              v-for="item in permissionPackages" 
              :key="item.id" 
              :label="item.permissionName" 
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="套餐到期时间" prop="dueTime">
          <el-date-picker
            v-model="adminForm.dueTime"
            type="datetime"
            placeholder="请选择套餐到期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="管理范围" prop="tenantType">
          <el-select v-model="adminForm.tenantType" placeholder="请选择管理范围" style="width: 100%" @change="handleTenantTypeChange">
            <el-option label="平台级" value="platform" :disabled="!isPlatformRole" />
            <el-option 
              v-for="item in tenantTypeOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
              :disabled="isPlatformRole" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="租户选择" prop="tenantIds" v-if="adminForm.tenantType !== 'platform'">
          <el-select v-model="adminForm.tenantIds" multiple placeholder="请选择具体租户" style="width: 100%">
            <el-option
              v-for="item in getTenantOptionsByType(adminForm.tenantType)"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
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
            <el-radio :value="'enabled'">启用</el-radio>
            <el-radio :value="'disabled'">禁用</el-radio>
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
import { getAdminList, addAdmin, updateAdmin, deleteAdmin, assignAdminPermission, getAdminDetail, setAdminDueTime } from '../../../api/admin'
import { getAllPrices } from '../../../api/permission'
import { getAllTenantTypes, getTenantsByType, getAllTenantDetails } from '../../../api/tenant'
import request from '../../../utils/request'

// 本地存储管理员租户信息的键名前缀
const ADMIN_TENANT_INFO_KEY = 'admin_tenant_info_'

// 保存管理员的租户信息到本地存储
const saveAdminTenantInfo = (adminId, tenantType, tenantIds) => {
  const key = `${ADMIN_TENANT_INFO_KEY}${adminId}`
  const data = {
    tenantType,
    tenantIds
  }
  localStorage.setItem(key, JSON.stringify(data))
  console.log('保存管理员租户信息到本地存储:', adminId, data)
}

// 从本地存储获取管理员的租户信息
const getAdminTenantInfoFromStorage = (adminId) => {
  const key = `${ADMIN_TENANT_INFO_KEY}${adminId}`
  const data = localStorage.getItem(key)
  if (data) {
    try {
      const parsed = JSON.parse(data)
      console.log('从本地存储获取管理员租户信息:', adminId, parsed)
      return parsed
    } catch (e) {
      console.error('解析本地存储的管理员租户信息失败:', e)
      return null
    }
  }
  return null
}

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
  permissionId: '',
  email: '',
  phone: '',
  status: 'enabled',
  password: '',
  confirmPassword: '',
  dueTime: null // 添加套餐到期时间字段
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

// 租户类型选项
const tenantTypeOptions = ref([])

// 租户类型映射
const tenantTypeMap = ref({})

// 所有租户选项，按类型分组
const tenantOptionsByType = ref({})

// 权限选项
const permissionPackages = ref([])

// 根据ID获取租户类型字符串
const getTenantTypeString = (typeId) => {
  return tenantTypeMap.value[typeId] || typeId
}

// 根据字符串获取租户类型ID
const getTenantTypeId = (typeString) => {
  return tenantTypeMap.value[typeString] || typeString
}

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
  
  // 构建查询参数
  const params = {
    page: currentPage.value,
    limit: pageSize.value
  }
  
  // 添加搜索条件
  if (searchQuery.value) {
    params.username = searchQuery.value
  }
  
  if (roleFilter.value) {
    params.identity = roleFilter.value
  }
  
  console.log('获取管理员列表，参数：', params)
  
  // 调用API获取数据
  getAdminList(params)
    .then(res => {
      console.log('获取管理员列表成功:', res)
      if (res.code === 0 || res.code === 200) {
        // 处理后端返回的数据
        // 后端直接返回了数据数组
        if (Array.isArray(res.data)) {
          adminList.value = processAdminList(res.data)
          total.value = res.data.length
        } else if (res.data && Array.isArray(res.data.list)) {
          // 如果返回的是 { list, total } 结构
          adminList.value = processAdminList(res.data.list)
          total.value = res.data.total || res.data.list.length
        } else {
          // 数据是直接的对象数组，没有嵌套在list属性中
          adminList.value = processAdminList(res.data)
          total.value = res.data.length
        }
      } else {
        ElMessage.error(res.message || res.msg || '获取管理员列表失败')
        adminList.value = []
        total.value = 0
      }
    })
    .catch(err => {
      console.error('获取管理员列表失败:', err)
      ElMessage.error('获取管理员列表失败')
      adminList.value = []
      total.value = 0
    })
    .finally(() => {
      loading.value = false
    })
}

// 处理管理员列表数据，确保所有需要的字段都存在
const processAdminList = (list) => {
  return list.map(item => {
    // 确保所有需要的字段都存在
    return {
      ...item,
      // 如果缺少字段，使用默认值
      name: item.name || '',
      email: item.email || '',
      phone: item.phone || '',
      status: item.status || 'enabled',
      // 如果role字段存在但identity不存在，使用role作为identity
      identity: item.identity || item.role || '',
      // 如果后端只返回了id, username, identity字段，添加其他必要字段
      role: item.role || item.identity || '',
      permissionId: item.permissionId || null,
      lastLoginTime: item.lastLoginTime || '-',
      dueTime: item.dueTime || null
    }
  })
}

// 获取权限套餐列表
const fetchPermissionPackages = () => {
  getAllPrices()
    .then(res => {
      console.log('获取权限套餐列表成功:', res)
      if (res.code === 0 || res.code === 200) {
        permissionPackages.value = res.data || []
      } else {
        ElMessage.error(res.message || '获取权限套餐列表失败')
        permissionPackages.value = []
      }
    })
    .catch(err => {
      console.error('获取权限套餐列表失败:', err)
      ElMessage.error('获取权限套餐列表失败')
      permissionPackages.value = []
    })
}

// 获取租户选项
const fetchTenantOptions = () => {
  // 获取所有租户类型
  getAllTenantTypes({ page: 1, limit: 100 })
    .then(res => {
      if (res.code === 0 || res.code === 200) {
        const types = res.data?.list || []
        tenantTypeOptions.value = types.map(item => ({
          value: item.id.toString(),
          label: item.name
        }))
        
        // 更新租户类型映射
        const map = {}
        types.forEach(type => {
          // 创建双向映射：ID -> 类型标识，类型标识 -> ID
          // 使用类型名称的拼音或英文作为标识（如果有）或使用ID作为标识
          const typeKey = type.code || `type_${type.id}`
          map[type.id] = typeKey
          map[typeKey] = type.id.toString()
        })
        tenantTypeMap.value = map
      } else {
        console.error('获取租户类型失败:', res.message)
      }
    })
    .catch(err => {
      console.error('获取租户类型失败:', err)
    })

  // 获取所有租户详情（包含类型分组）
  getAllTenantDetails()
    .then(res => {
      if (res.code === 0 || res.code === 200) {
        // 处理租户详情数据
        const tenantDetails = res.data || []
        const optionsByType = {}
        
        // 检查是否是数组
        if (Array.isArray(tenantDetails)) {
          // 按类型分组租户
          tenantDetails.forEach(detail => {
            const typeId = detail.typeId?.toString()
            if (typeId) {
              // 确保tenants是数组
              const tenants = Array.isArray(detail.tenants) ? detail.tenants : []
              optionsByType[typeId] = tenants.map(item => ({
                value: item.id.toString(),
                label: item.name
              }))
            }
          })
        } else {
          console.error('租户详情数据格式错误:', res.data)
        }
        
        tenantOptionsByType.value = optionsByType
      } else {
        console.error('获取租户详情失败:', res.message)
      }
    })
    .catch(err => {
      console.error('获取租户详情失败:', err)
    })
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
    permissionId: '',
    email: '',
    phone: '',
    status: 'enabled',
    password: '',
    confirmPassword: '',
    dueTime: null // 添加套餐到期时间字段
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

// 处理租户类型变更
const handleTenantTypeChange = (type) => {
  console.log('租户类型变更:', type)
  
  // 如果选择了平台级，清空租户选择
  if (type === 'platform') {
    adminForm.tenantIds = []
    return
  }
  
  // 尝试将type转换为ID
  let typeId = type
  if (isNaN(type)) {
    // 如果不是数字，尝试通过映射获取ID
    typeId = getTenantTypeId(type)
  }
  
  console.log('租户类型ID:', typeId)
  
  // 检查是否已经有该类型的租户选项
  const typeIdStr = typeId?.toString()
  if (tenantOptionsByType.value[typeIdStr] && tenantOptionsByType.value[typeIdStr].length > 0) {
    console.log(`已有租户选项(类型ID: ${typeIdStr}):`, tenantOptionsByType.value[typeIdStr])
    return
  }
  
  // 获取该类型的租户列表
  if (typeId) {
    console.log(`正在获取租户列表(类型ID: ${typeId})...`)
    
    // 构建查询参数
    const params = {
      typeId: typeId,
      page: 1,
      limit: 100
    }
    
    getTenantsByType(params)
      .then(res => {
        console.log(`获取租户列表成功(类型ID: ${typeId}):`, res)
        if (res.code === 0 || res.code === 200) {
          // 处理租户列表数据
          let tenantList = []
          
          // 检查返回数据结构
          if (Array.isArray(res.data)) {
            tenantList = res.data
          } else if (res.data && Array.isArray(res.data.list)) {
            tenantList = res.data.list
          }
          
          if (Array.isArray(tenantList)) {
            const formattedTenants = tenantList.map(item => ({
              value: item.id.toString(),
              label: item.name
            }))
            
            console.log('格式化后的租户选项:', formattedTenants)
            
            // 更新该类型的租户选项
            tenantOptionsByType.value = {
              ...tenantOptionsByType.value,
              [typeIdStr]: formattedTenants
            }
          } else {
            console.error('租户列表数据格式错误:', res.data)
          }
        }
      })
      .catch(err => {
        console.error(`获取租户列表失败(类型ID: ${typeId}):`, err)
      })
  }
}

// 编辑管理员
const handleEdit = (row) => {
  dialogType.value = 'edit'
  
  // 创建一个带有默认值的对象，防止缺少某些属性
  const defaultAdmin = {
    id: '',
    username: '',
    name: '',
    role: '', 
    tenantType: 'platform', // 默认为平台级
    tenantIds: [],
    permissionId: '',
    email: '',
    phone: '',
    status: 'enabled',
    password: '',
    confirmPassword: '',
    dueTime: null // 添加套餐到期时间字段
  }
  
  // 合并默认值
  Object.assign(adminForm, defaultAdmin)
  
  // 设置基本字段
  adminForm.id = row.id
  adminForm.username = row.username
  
  // 获取管理员详细信息
  getAdminDetail(row.id)
    .then(res => {
      if (res.code === 0 || res.code === 200) {
        const adminData = res.data
        
        // 更新表单数据
        adminForm.name = adminData.name || ''
        adminForm.role = adminData.identity || ''
        adminForm.permissionId = adminData.permissionId || ''
        adminForm.email = adminData.email || ''
        adminForm.phone = adminData.phone || ''
        adminForm.status = adminData.status || 'enabled'
        adminForm.dueTime = adminData.dueTime || null
        
        // 处理租户类型和租户选择
        // 如果是平台级角色
        if (['超级管理员', '系统管理员'].includes(adminData.identity)) {
          adminForm.tenantType = 'platform'
          adminForm.tenantIds = []
        } 
        // 如果是非平台级角色，尝试从本地存储获取租户信息
        else {
          // 从本地存储获取管理员的租户信息
          const storedTenantInfo = getAdminTenantInfoFromStorage(row.id)
          
          if (storedTenantInfo && storedTenantInfo.tenantType) {
            // 设置租户类型
            adminForm.tenantType = storedTenantInfo.tenantType.toString()
            console.log('编辑管理员 - 从本地存储设置租户类型:', adminForm.tenantType)
            
            // 确保租户列表已加载
            handleTenantTypeChange(adminForm.tenantType)
            
            // 设置选中的租户
            if (storedTenantInfo.tenantIds && Array.isArray(storedTenantInfo.tenantIds)) {
              adminForm.tenantIds = storedTenantInfo.tenantIds.map(id => id.toString())
              console.log('编辑管理员 - 从本地存储设置租户IDs:', adminForm.tenantIds)
            }
          } else {
            console.log('本地存储中没有管理员租户信息')
            
            // 如果本地存储中没有数据，尝试从row中获取
            if (row.tenantType) {
              adminForm.tenantType = row.tenantType.toString()
              
              if (row.tenantIds) {
                adminForm.tenantIds = Array.isArray(row.tenantIds) 
                  ? row.tenantIds.map(id => id.toString())
                  : []
              }
              
              // 确保租户列表已加载
              handleTenantTypeChange(adminForm.tenantType)
            } else {
              // 如果没有任何租户信息，设置一个默认的非平台级租户类型
              // 这里假设第一个租户类型是非平台级的
              if (tenantTypeOptions.value.length > 0) {
                const firstTypeOption = tenantTypeOptions.value[0]
                adminForm.tenantType = firstTypeOption.value
                console.log('编辑管理员 - 设置默认租户类型:', adminForm.tenantType)
                
                // 确保租户列表已加载
                handleTenantTypeChange(adminForm.tenantType)
              }
            }
          }
        }
      } else {
        ElMessage.error('获取管理员详情失败')
      }
    })
    .catch(err => {
      console.error('获取管理员详情失败:', err)
      ElMessage.error('获取管理员详情失败')
    })
  
  dialogVisible.value = true
}

// 删除管理员
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除管理员 ${row.username} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteAdmin(row.id)
      .then(res => {
        console.log('删除管理员成功:', res)
        if (res.code === 0 || res.code === 200) {
          ElMessage.success('删除成功')
          fetchAdminList() // 重新加载数据
        } else {
          ElMessage.error(res.message || '删除失败')
        }
      })
      .catch(err => {
        console.error('删除管理员失败:', err)
        ElMessage.error('删除失败')
      })
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
    // 后端API不支持批量删除，逐个删除
    const deletePromises = ids.map(id => deleteAdmin(id))
    Promise.all(deletePromises)
      .then(results => {
    ElMessage.success('批量删除成功')
        fetchAdminList() // 重新加载数据
      })
      .catch(err => {
        console.error('批量删除管理员失败:', err)
        ElMessage.error('部分管理员删除失败')
        // 重新加载数据
        fetchAdminList()
      })
  }).catch(() => {})
}

// 状态变更
const handleStatusChange = (row) => {
  const statusText = row.status === 'enabled' ? '启用' : '禁用'
  ElMessage.success(`已${statusText}管理员 ${row.username}`)
  
  // 这里应该调用API更新状态
  const updateData = {
    id: row.id,
    status: row.status
  }
  
  updateAdmin(updateData)
    .then(res => {
      console.log('更新管理员状态成功:', res)
      if (res.code !== 0 && res.code !== 200) {
        ElMessage.error(res.message || '更新状态失败')
        // 回滚状态
        row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
      }
    })
    .catch(err => {
      console.error('更新管理员状态失败:', err)
      ElMessage.error('更新状态失败')
      // 回滚状态
      row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
    })
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
      // 打印完整的表单数据，用于调试
      console.log('完整的表单数据:', JSON.parse(JSON.stringify(adminForm)))
      
      // 准备提交的数据
      const submitData = {
        username: adminForm.username,
        name: adminForm.name || '', // 确保name字段有值
        identity: adminForm.role, // 使用role字段作为identity
        email: adminForm.email || '', // 确保email字段有值
        phone: adminForm.phone || '', // 确保phone字段有值
      }
      
      // 如果有状态，添加状态
      if (adminForm.hasOwnProperty('status')) {
        submitData.status = adminForm.status
      }
      
      // 如果是编辑操作，需要包含ID
      if (dialogType.value === 'edit') {
        submitData.id = adminForm.id
      } else {
        // 添加操作需要密码
        submitData.password = adminForm.password
      }
      
      // 添加权限套餐ID
      if (adminForm.permissionId) {
        submitData.permissionId = adminForm.permissionId
      }
      
      // 处理租户类型和租户选择
      // 非平台级管理员
      if (adminForm.tenantType && adminForm.tenantType !== 'platform') {
        console.log('提交表单 - 非平台级管理员')
        console.log('提交表单 - 租户类型:', adminForm.tenantType)
        
        // 直接使用租户类型ID
        submitData.tenantType = parseInt(adminForm.tenantType)
        
        // 添加租户IDs - 确保是数字数组
        submitData.tenantIds = adminForm.tenantIds && adminForm.tenantIds.length > 0
          ? adminForm.tenantIds.map(id => parseInt(id))
          : []
          
        console.log('提交表单 - 处理后的租户类型:', submitData.tenantType)
        console.log('提交表单 - 处理后的租户IDs:', submitData.tenantIds)
        
        // 保存租户信息到本地存储
        if (submitData.id) {
          saveAdminTenantInfo(
            submitData.id, 
            adminForm.tenantType, 
            adminForm.tenantIds
          )
        }
      } 
      // 平台级管理员
      else if (adminForm.tenantType === 'platform' || ['超级管理员', '系统管理员'].includes(adminForm.role)) {
        console.log('提交表单 - 平台级管理员')
        // 平台级管理员不关联租户类型和租户
        submitData.tenantType = null
        submitData.tenantIds = []
        
        // 保存租户信息到本地存储（清空租户信息）
        if (submitData.id) {
          saveAdminTenantInfo(submitData.id, 'platform', [])
        }
      }
      
      console.log('准备提交管理员表单:', JSON.stringify(submitData), '操作类型:', dialogType.value)
      
      const apiCall = dialogType.value === 'add' 
        ? addAdmin(submitData)
        : updateAdmin(submitData)
      
      apiCall
        .then(res => {
          console.log(dialogType.value === 'add' ? '添加管理员成功:' : '编辑管理员成功:', res)
          if (res.code === 0 || res.code === 200) {
            // 如果是添加操作且成功，需要保存租户信息到本地存储
            if (dialogType.value === 'add' && res.data && res.data.id) {
              const newAdminId = res.data.id
              
              // 非平台级管理员
              if (adminForm.tenantType && adminForm.tenantType !== 'platform') {
                saveAdminTenantInfo(
                  newAdminId, 
                  adminForm.tenantType, 
                  adminForm.tenantIds
                )
              } 
              // 平台级管理员
              else if (adminForm.tenantType === 'platform') {
                saveAdminTenantInfo(newAdminId, 'platform', [])
              }
              
              // 如果设置了套餐到期时间，调用相关API
              if (adminForm.dueTime) {
                setAdminDueTime(newAdminId, adminForm.dueTime)
                  .then(() => console.log('设置新添加管理员的套餐到期时间成功'))
                  .catch(err => console.error('设置新添加管理员的套餐到期时间失败:', err))
              }
            } 
            // 如果是编辑操作且成功，且设置了套餐到期时间
            else if (dialogType.value === 'edit' && adminForm.id && adminForm.dueTime) {
              setAdminDueTime(adminForm.id, adminForm.dueTime)
                .then(() => console.log('更新管理员的套餐到期时间成功'))
                .catch(err => console.error('更新管理员的套餐到期时间失败:', err))
            }
            
            ElMessage.success(dialogType.value === 'add' ? '添加管理员成功' : '编辑管理员成功')
            dialogVisible.value = false
            fetchAdminList() // 重新加载数据
          } else {
            ElMessage.error(res.message || res.msg || (dialogType.value === 'add' ? '添加管理员失败' : '编辑管理员失败'))
          }
        })
        .catch(err => {
          console.error(dialogType.value === 'add' ? '添加管理员失败:' : '编辑管理员失败:', err)
          ElMessage.error(dialogType.value === 'add' ? '添加管理员失败' : '编辑管理员失败')
        })
    } else {
      return false
    }
  })
}

// 提交重置密码
const submitResetPwd = () => {
  resetPwdFormRef.value.validate((valid) => {
    if (valid) {
      // 这里应该调用API重置密码
      const resetData = {
        id: resetPwdForm.userId,
        password: resetPwdForm.password
      }
      
      updateAdmin(resetData)
        .then(res => {
          console.log('重置密码成功:', res)
          if (res.code === 0 || res.code === 200) {
            ElMessage.success(`已重置 ${resetPwdForm.username} 的密码`)
            resetPwdVisible.value = false
          } else {
            ElMessage.error(res.message || '重置密码失败')
          }
        })
        .catch(err => {
          console.error('重置密码失败:', err)
          ElMessage.error('重置密码失败')
        })
    } else {
      return false
    }
  })
}

// 获取权限套餐名称
const getPermissionPackageName = (id) => {
  if (!id) return '-'
  const pkg = permissionPackages.value.find(item => item.id == id)
  return pkg ? pkg.permissionName : `套餐${id}`
}

// 获取租户选项
const getTenantOptionsByType = (type) => {
  if (type === 'platform') {
    return []
  }
  
  // 尝试将type转换为ID
  let typeId = type
  if (isNaN(type)) {
    // 如果不是数字，尝试通过映射获取ID
    typeId = getTenantTypeId(type)
  }
  
  // 确保typeId是字符串
  const typeIdStr = typeId?.toString()
  
  // 获取该类型的租户选项
  const options = tenantOptionsByType.value[typeIdStr] || []
  console.log(`获取租户选项 - 类型: ${type}, 转换ID: ${typeIdStr}, 选项数量: ${options.length}`)
  
  // 返回该类型的租户选项，如果没有则返回空数组
  return options
}

// 格式化套餐到期时间
const formatDueTime = (dueTime) => {
  if (!dueTime) return null
  
  // 如果是字符串类型，直接返回
  if (typeof dueTime === 'string') {
    return dueTime
  }
  
  // 如果是日期对象，格式化为字符串
  try {
    // 将ISO日期字符串转换为本地时间格式
    const date = new Date(dueTime)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    console.error('日期格式化错误:', error)
    return dueTime.toString()
  }
}

onMounted(() => {
  fetchAdminList()
  fetchPermissionPackages()
  fetchTenantOptions()
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