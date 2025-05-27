<template>
  <div class="permission-management">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAddPermission">添加权限</el-button>
      <el-button type="danger" :disabled="selectedPermissions.length === 0" @click="handleBatchDelete">批量删除</el-button>
    </div>

    <!-- 角色选择 -->
    <div class="role-selector">
      <span class="label">选择角色：</span>
      <el-radio-group v-model="currentRole" @change="handleRoleChange">
        <el-radio-button label="超级管理员">超级管理员</el-radio-button>
        <el-radio-button label="系统管理员">系统管理员</el-radio-button>
        <el-radio-button label="安全管理员">安全管理员</el-radio-button>
        <el-radio-button label="操作员">操作员</el-radio-button>
        <el-radio-button label="访客">访客</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 权限列表 -->
    <el-table
      :data="permissionList"
      border
      style="width: 100%"
      v-loading="loading"
      @selection-change="handleSelectionChange"
      row-key="id"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="权限名称" width="180" />
      <el-table-column prop="code" label="权限标识" width="180" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="type" label="类型" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.type === '菜单' ? 'success' : scope.row.type === '按钮' ? 'info' : 'primary'">
            {{ scope.row.type }}
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
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 添加/编辑权限对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加权限' : '编辑权限'"
      width="500px"
    >
      <el-form
        :model="permissionForm"
        label-width="100px"
        :rules="rules"
        ref="permissionFormRef"
      >
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="permissionForm.name" />
        </el-form-item>
        <el-form-item label="权限标识" prop="code">
          <el-input v-model="permissionForm.code" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="permissionForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="权限类型" prop="type">
          <el-select v-model="permissionForm.type" placeholder="请选择权限类型" style="width: 100%">
            <el-option label="页面" value="页面" />
            <el-option label="菜单" value="菜单" />
            <el-option label="按钮" value="按钮" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="permissionForm.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPermissionForm">确认</el-button>
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
const permissionList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedPermissions = ref([])
const currentRole = ref('超级管理员')

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add') // add 或 edit
const permissionFormRef = ref(null)
const permissionForm = reactive({
  id: '',
  name: '',
  code: '',
  description: '',
  type: '',
  status: 'enabled',
  roleId: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入权限标识', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择权限类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 获取权限列表
const getPermissionList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    // 模拟数据
    const mockPermissions = [
      {
        id: 1,
        name: '首页',
        code: 'dashboard',
        description: '访问首页仪表盘',
        type: '页面',
        status: 'enabled'
      },
      {
        id: 2,
        name: '设备管理',
        code: 'device:view',
        description: '查看设备列表',
        type: '页面',
        status: 'enabled'
      },
      {
        id: 3,
        name: '添加设备',
        code: 'device:add',
        description: '添加新设备',
        type: '按钮',
        status: 'enabled'
      },
      {
        id: 4,
        name: '编辑设备',
        code: 'device:edit',
        description: '编辑设备信息',
        type: '按钮',
        status: 'enabled'
      },
      {
        id: 5,
        name: '删除设备',
        code: 'device:delete',
        description: '删除设备',
        type: '按钮',
        status: 'enabled'
      },
      {
        id: 6,
        name: '数据分析',
        code: 'analysis:view',
        description: '查看数据分析',
        type: '页面',
        status: 'enabled'
      },
      {
        id: 7,
        name: '告警管理',
        code: 'alarm:view',
        description: '查看告警信息',
        type: '页面',
        status: 'enabled'
      },
      {
        id: 8,
        name: '用户管理',
        code: 'user:view',
        description: '查看用户列表',
        type: '页面',
        status: 'enabled'
      },
      {
        id: 9,
        name: '系统设置',
        code: 'settings:view',
        description: '访问系统设置',
        type: '菜单',
        status: 'enabled'
      },
      {
        id: 10,
        name: '导出数据',
        code: 'data:export',
        description: '导出数据',
        type: '按钮',
        status: 'enabled'
      }
    ]
    
    // 根据角色过滤权限
    let filteredPermissions = [...mockPermissions]
    if (currentRole.value === '操作员') {
      filteredPermissions = mockPermissions.filter(p => !['settings:view', 'user:view'].includes(p.code))
    } else if (currentRole.value === '访客') {
      filteredPermissions = mockPermissions.filter(
        p => ['dashboard', 'device:view', 'analysis:view', 'alarm:view'].includes(p.code)
      )
    }
    
    // 分页
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    permissionList.value = filteredPermissions.slice(start, end)
    total.value = filteredPermissions.length
    
    loading.value = false
  }, 500)
}

// 角色变更
const handleRoleChange = () => {
  currentPage.value = 1
  getPermissionList()
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedPermissions.value = selection
}

// 分页变化
const handleSizeChange = (val) => {
  pageSize.value = val
  getPermissionList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getPermissionList()
}

// 添加权限
const handleAddPermission = () => {
  dialogType.value = 'add'
  resetPermissionForm()
  dialogVisible.value = true
}

// 编辑权限
const handleEdit = (row) => {
  dialogType.value = 'edit'
  // 填充表单
  Object.assign(permissionForm, {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description,
    type: row.type,
    status: row.status
  })
  dialogVisible.value = true
}

// 删除权限
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确认删除权限 ${row.name}?`,
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
        const index = permissionList.value.findIndex(item => item.id === row.id)
        if (index !== -1) {
          permissionList.value.splice(index, 1)
          total.value--
        }
        ElMessage.success('权限已删除')
      }, 300)
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedPermissions.value.length === 0) return
  
  ElMessageBox.confirm(
    `确认删除选中的 ${selectedPermissions.value.length} 个权限?`,
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
        const ids = selectedPermissions.value.map(item => item.id)
        permissionList.value = permissionList.value.filter(item => !ids.includes(item.id))
        total.value -= ids.length
        
        ElMessage.success(`已删除 ${ids.length} 个权限`)
        selectedPermissions.value = []
      }, 300)
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 修改状态
const handleStatusChange = (row) => {
  const statusText = row.status === 'enabled' ? '启用' : '禁用'
  ElMessage.success(`权限 ${row.name} 已${statusText}`)
}

// 重置表单
const resetPermissionForm = () => {
  if (permissionFormRef.value) {
    permissionFormRef.value.resetFields()
  }
  Object.assign(permissionForm, {
    id: '',
    name: '',
    code: '',
    description: '',
    type: '',
    status: 'enabled'
  })
}

// 提交表单
const submitPermissionForm = () => {
  if (!permissionFormRef.value) return
  
  permissionFormRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 添加权限
        const newPermission = {
          id: total.value + 1,
          name: permissionForm.name,
          code: permissionForm.code,
          description: permissionForm.description,
          type: permissionForm.type,
          status: permissionForm.status
        }
        permissionList.value.unshift(newPermission)
        total.value++
        ElMessage.success('权限添加成功')
      } else {
        // 编辑权限
        const index = permissionList.value.findIndex(item => item.id === permissionForm.id)
        if (index !== -1) {
          Object.assign(permissionList.value[index], {
            name: permissionForm.name,
            code: permissionForm.code,
            description: permissionForm.description,
            type: permissionForm.type,
            status: permissionForm.status
          })
        }
        ElMessage.success('权限更新成功')
      }
      
      dialogVisible.value = false
    }
  })
}

onMounted(() => {
  getPermissionList()
})
</script>

<style scoped>
.permission-management {
  width: 100%;
}

.operation-bar {
  margin-bottom: 20px;
}

.role-selector {
  margin-bottom: 20px;
}

.role-selector .label {
  margin-right: 10px;
  font-weight: bold;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 