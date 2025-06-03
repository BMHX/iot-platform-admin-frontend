<template>
  <div class="permission-management">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAddPermission">添加权限</el-button>
      <el-button type="danger" :disabled="selectedPermissions.length === 0" @click="handleBatchDelete">批量删除</el-button>
    </div>

    <!-- 角色选择 -->
    <div class="role-selector">
      <span class="label">角色级别：</span>
      <el-radio-group v-model="roleLevel" @change="handleRoleLevelChange">
        <el-radio-button label="platform">平台级</el-radio-button>
        <el-radio-button label="tenant">租户级</el-radio-button>
      </el-radio-group>
      
      <span class="label" style="margin-left: 20px">选择角色：</span>
      <el-select v-model="currentRole" placeholder="请选择角色" @change="handleRoleChange">
        <el-option
          v-for="role in filteredRoles"
          :key="role.id"
          :label="role.name"
          :value="role.id"
        />
      </el-select>
    </div>

    <!-- 权限列表 -->
    <el-table
      :data="permissionList"
      border
      style="width: 100%; margin-top: 15px"
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
          <el-tag :type="scope.row.type === 'menu' ? 'success' : scope.row.type === 'button' ? 'info' : 'primary'">
            {{ scope.row.type === 'menu' ? '菜单' : scope.row.type === 'button' ? '按钮' : '页面' }}
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
      width="600px"
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
            <el-option label="页面" value="page" />
            <el-option label="菜单" value="menu" />
            <el-option label="按钮" value="button" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属菜单" prop="menuId" v-if="permissionForm.type === 'button'">
          <el-cascader
            v-model="permissionForm.menuPath"
            :options="menuOptions"
            :props="{ 
              checkStrictly: true,
              label: 'name',
              value: 'id',
              emitPath: true
            }"
            clearable
            placeholder="请选择所属菜单"
            style="width: 100%"
            @change="handleMenuChange"
          />
        </el-form-item>
        <el-form-item label="角色级别" prop="roleLevel">
          <el-radio-group v-model="permissionForm.roleLevel">
            <el-radio label="platform">平台级</el-radio>
            <el-radio label="tenant">租户级</el-radio>
            <el-radio label="both">通用</el-radio>
          </el-radio-group>
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 列表数据
const loading = ref(false)
const permissionList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedPermissions = ref([])
const roleLevel = ref('platform')
const currentRole = ref('')

// 角色列表
const roles = ref([
  // 平台级角色
  { id: '1', name: '超级管理员', level: 'platform' },
  { id: '2', name: '系统管理员', level: 'platform' },
  { id: '3', name: '安全审计员', level: 'platform' },
  // 租户级角色
  { id: '4', name: '租户管理员', level: 'tenant' },
  { id: '5', name: '数据查看员', level: 'tenant' },
  { id: '6', name: '设备操作员', level: 'tenant' }
])

// 菜单选项，用于按钮权限关联
const menuOptions = ref([
  {
    id: '1',
    name: '系统管理',
    children: [
      { id: '1-1', name: '管理员管理' },
      { id: '1-2', name: '权限管理' },
      { id: '1-3', name: '菜单管理' }
    ]
  },
  {
    id: '2',
    name: '平台管理',
    children: [
      { id: '2-1', name: '版本管理' },
      { id: '2-2', name: '协议管理' }
    ]
  },
  {
    id: '3',
    name: '租户管理',
    children: [
      { id: '3-1', name: '学校管理' },
      { id: '3-2', name: '小区管理' },
      { id: '3-3', name: '驿站管理' }
    ]
  },
  {
    id: '4',
    name: '设备管理',
    children: [
      { id: '4-1', name: '设备列表' },
      { id: '4-2', name: '设备分组' },
      { id: '4-3', name: '设备监控' }
    ]
  },
  {
    id: '5',
    name: '统计管理',
    children: [
      { id: '5-1', name: '租户统计' },
      { id: '5-2', name: '设备统计' },
      { id: '5-3', name: '用户统计' },
      { id: '5-4', name: '告警统计' }
    ]
  },
  {
    id: '6',
    name: 'App管理',
    children: [
      { id: '6-1', name: '用户管理' },
      { id: '6-2', name: '版本管理' }
    ]
  }
])

// 根据当前选择的角色级别过滤角色列表
const filteredRoles = computed(() => {
  return roles.value.filter(role => role.level === roleLevel.value)
})

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add') // add 或 edit
const permissionFormRef = ref(null)
const permissionForm = reactive({
  id: '',
  name: '',
  code: '',
  description: '',
  type: 'page',
  menuId: '',
  menuPath: [],
  roleLevel: 'platform',
  status: 'enabled'
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
  menuPath: [
    { required: true, message: '请选择所属菜单', trigger: 'change', type: 'array' }
  ],
  roleLevel: [
    { required: true, message: '请选择角色级别', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 角色级别变更
const handleRoleLevelChange = (level) => {
  currentRole.value = ''
  fetchPermissionList()
}

// 角色变更
const handleRoleChange = (roleId) => {
  fetchPermissionList()
}

// 菜单选择变更
const handleMenuChange = (value) => {
  if (value && value.length > 0) {
    permissionForm.menuId = value[value.length - 1]
  } else {
    permissionForm.menuId = ''
  }
}

// 获取权限列表
const fetchPermissionList = () => {
  if (!currentRole.value) return
  
  loading.value = true
  // 这里应该调用API获取数据
  // 模拟数据
  setTimeout(() => {
    // 根据当前选择的角色生成不同的权限列表
    if (currentRole.value === '1') { // 超级管理员
      permissionList.value = [
        {
          id: 1,
          name: '系统管理-查看',
          code: 'system:view',
          description: '查看系统管理页面',
          type: 'page',
          status: 'enabled'
        },
        {
          id: 2,
          name: '系统管理-管理员管理',
          code: 'system:admin:view',
          description: '查看管理员列表',
          type: 'menu',
          status: 'enabled'
        },
        {
          id: 3,
          name: '添加管理员',
          code: 'system:admin:add',
          description: '添加新管理员',
          type: 'button',
          menuId: '1-1',
          status: 'enabled'
        },
        {
          id: 4,
          name: '编辑管理员',
          code: 'system:admin:edit',
          description: '编辑管理员信息',
          type: 'button',
          menuId: '1-1',
          status: 'enabled'
        },
        {
          id: 5,
          name: '删除管理员',
          code: 'system:admin:delete',
          description: '删除管理员',
          type: 'button',
          menuId: '1-1',
          status: 'enabled'
        },
        {
          id: 6,
          name: '系统管理-权限管理',
          code: 'system:permission:view',
          description: '查看权限列表',
          type: 'menu',
          status: 'enabled'
        },
        {
          id: 7,
          name: '添加权限',
          code: 'system:permission:add',
          description: '添加新权限',
          type: 'button',
          menuId: '1-2',
          status: 'enabled'
        }
      ]
    } else if (currentRole.value === '4') { // 租户管理员
      permissionList.value = [
        {
          id: 101,
          name: '设备管理-查看',
          code: 'device:view',
          description: '查看设备列表',
          type: 'page',
          status: 'enabled'
        },
        {
          id: 102,
          name: '添加设备',
          code: 'device:add',
          description: '添加新设备',
          type: 'button',
          menuId: '4-1',
          status: 'enabled'
        },
        {
          id: 103,
          name: '编辑设备',
          code: 'device:edit',
          description: '编辑设备信息',
          type: 'button',
          menuId: '4-1',
          status: 'enabled'
        },
        {
          id: 104,
          name: '删除设备',
          code: 'device:delete',
          description: '删除设备',
          type: 'button',
          menuId: '4-1',
          status: 'enabled'
        },
        {
          id: 105,
          name: '统计管理-查看',
          code: 'statistics:view',
          description: '查看统计数据',
          type: 'page',
          status: 'enabled'
        },
        {
          id: 106,
          name: '导出统计数据',
          code: 'statistics:export',
          description: '导出统计数据',
          type: 'button',
          menuId: '5-1',
          status: 'enabled'
        }
      ]
    } else {
      permissionList.value = []
    }
    
    total.value = permissionList.value.length
    loading.value = false
  }, 500)
}

// 表格选择
const handleSelectionChange = (selection) => {
  selectedPermissions.value = selection
}

// 分页
const handleSizeChange = (size) => {
  pageSize.value = size
  fetchPermissionList()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchPermissionList()
}

// 添加权限
const handleAddPermission = () => {
  dialogType.value = 'add'
  Object.assign(permissionForm, {
    id: '',
    name: '',
    code: '',
    description: '',
    type: 'page',
    menuId: '',
    menuPath: [],
    roleLevel: roleLevel.value,
    status: 'enabled'
  })
  dialogVisible.value = true
}

// 编辑权限
const handleEdit = (row) => {
  dialogType.value = 'edit'
  
  // 设置菜单路径
  let menuPath = []
  if (row.type === 'button' && row.menuId) {
    // 根据menuId查找菜单路径
    for (const menu of menuOptions.value) {
      for (const submenu of menu.children || []) {
        if (submenu.id === row.menuId) {
          menuPath = [menu.id, submenu.id]
          break
        }
      }
      if (menuPath.length > 0) break
    }
  }
  
  Object.assign(permissionForm, {
    ...row,
    menuPath
  })
  
  dialogVisible.value = true
}

// 删除权限
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除权限 ${row.name} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 这里应该调用API删除数据
    permissionList.value = permissionList.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedPermissions.value.length === 0) {
    return
  }
  
  const names = selectedPermissions.value.map(item => item.name).join('、')
  const ids = selectedPermissions.value.map(item => item.id)
  
  ElMessageBox.confirm(`确定要删除以下权限吗？\n${names}`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 这里应该调用API删除数据
    permissionList.value = permissionList.value.filter(item => !ids.includes(item.id))
    ElMessage.success('批量删除成功')
  }).catch(() => {})
}

// 状态变更
const handleStatusChange = (row) => {
  const statusText = row.status === 'enabled' ? '启用' : '禁用'
  ElMessage.success(`已${statusText}权限 ${row.name}`)
}

// 提交权限表单
const submitPermissionForm = () => {
  permissionFormRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 添加权限
        const newPermission = {
          id: Date.now(),
          ...permissionForm
        }
        permissionList.value.unshift(newPermission)
        ElMessage.success('添加权限成功')
      } else {
        // 编辑权限
        const index = permissionList.value.findIndex(item => item.id === permissionForm.id)
        if (index !== -1) {
          permissionList.value[index] = { ...permissionList.value[index], ...permissionForm }
        }
        ElMessage.success('编辑权限成功')
      }
      dialogVisible.value = false
    } else {
      return false
    }
  })
}

onMounted(() => {
  // 默认选择第一个角色
  if (filteredRoles.value.length > 0) {
    currentRole.value = filteredRoles.value[0].id
    fetchPermissionList()
  }
})
</script>

<style scoped>
.permission-management {
  width: 100%;
}

.operation-bar {
  margin-bottom: 15px;
}

.role-selector {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.role-selector .label {
  margin-right: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>