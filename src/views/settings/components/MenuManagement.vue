<template>
  <div class="menu-management">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAddMenu">添加菜单</el-button>
      <el-button type="success" @click="expandAll">展开所有</el-button>
      <el-button @click="collapseAll">收起所有</el-button>
    </div>

    <!-- 菜单列表 -->
    <el-table
      ref="menuTableRef"
      :data="menuList"
      border
      style="width: 100%"
      v-loading="loading"
      row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="菜单名称" width="180" />
      <el-table-column prop="path" label="路由路径" width="180" />
      <el-table-column prop="component" label="组件路径" width="220" />
      <el-table-column prop="icon" label="图标" width="100">
        <template #default="scope">
          <el-icon v-if="scope.row.icon">
            <component :is="scope.row.icon" />
          </el-icon>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column prop="type" label="类型" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.type === '目录' ? 'warning' : scope.row.type === '菜单' ? 'success' : 'info'">
            {{ scope.row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="permission" label="权限标识" width="180" />
      <el-table-column label="显示" width="80">
        <template #default="scope">
          <el-switch
            v-model="scope.row.hidden"
            :active-value="false"
            :inactive-value="true"
            @change="handleVisibleChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="'enabled'"
            :inactive-value="'disabled'"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="success" @click="handleAddChild(scope.row)">添加子菜单</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑菜单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="(dialogType === 'add' ? '添加' : '编辑') + (isAddingChild ? '子菜单' : '菜单')"
      width="600px"
    >
      <el-form
        :model="menuForm"
        label-width="100px"
        :rules="rules"
        ref="menuFormRef"
      >
        <el-form-item label="上级菜单" v-if="dialogType === 'add' || isAddingChild">
          <el-tree-select
            v-model="menuForm.parentId"
            :data="menuTreeData"
            :props="{ label: 'name', value: 'id' }"
            :disabled="isAddingChild"
            check-strictly
            default-expand-all
            node-key="id"
            placeholder="请选择上级菜单"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="menuForm.type">
            <el-radio label="目录">目录</el-radio>
            <el-radio label="菜单">菜单</el-radio>
            <el-radio label="按钮">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="menuForm.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="路由路径" prop="path" v-if="menuForm.type !== '按钮'">
          <el-input v-model="menuForm.path" placeholder="请输入路由路径" />
        </el-form-item>
        <el-form-item label="组件路径" prop="component" v-if="menuForm.type === '菜单'">
          <el-input v-model="menuForm.component" placeholder="请输入组件路径" />
        </el-form-item>
        <el-form-item label="权限标识" prop="permission">
          <el-input v-model="menuForm.permission" placeholder="请输入权限标识" />
        </el-form-item>
        <el-form-item label="图标" v-if="menuForm.type !== '按钮'">
          <el-select v-model="menuForm.icon" placeholder="请选择图标" clearable style="width: 100%">
            <el-option label="仪表盘" value="DataBoard" />
            <el-option label="设备" value="Monitor" />
            <el-option label="数据" value="DataAnalysis" />
            <el-option label="告警" value="Alarm" />
            <el-option label="用户" value="User" />
            <el-option label="设置" value="Setting" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="menuForm.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="是否显示" v-if="menuForm.type !== '按钮'">
          <el-radio-group v-model="menuForm.hidden">
            <el-radio :label="false">显示</el-radio>
            <el-radio :label="true">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="menuForm.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitMenuForm">确认</el-button>
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
const menuList = ref([])
const menuTableRef = ref(null)

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add') // add 或 edit
const isAddingChild = ref(false)
const menuFormRef = ref(null)
const menuForm = reactive({
  id: '',
  parentId: null,
  name: '',
  path: '',
  component: '',
  icon: '',
  permission: '',
  type: '菜单',
  sort: 0,
  hidden: false,
  status: 'enabled',
  children: []
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' }
  ],
  path: [
    { required: true, message: '请输入路由路径', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择菜单类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 转换为树形结构数据
const menuTreeData = computed(() => {
  const rootNode = {
    id: 0,
    name: '根菜单',
    children: JSON.parse(JSON.stringify(menuList.value))
  }
  return [rootNode]
})

// 获取菜单列表
const getMenuList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    // 模拟数据
    menuList.value = [
      {
        id: 1,
        parentId: 0,
        name: '仪表盘',
        path: '/dashboard',
        component: 'views/dashboard/index',
        icon: 'DataBoard',
        permission: 'dashboard',
        type: '菜单',
        sort: 1,
        hidden: false,
        status: 'enabled',
        children: []
      },
      {
        id: 2,
        parentId: 0,
        name: '设备管理',
        path: '/devices',
        component: 'views/devices/index',
        icon: 'Monitor',
        permission: 'device:view',
        type: '菜单',
        sort: 2,
        hidden: false,
        status: 'enabled',
        children: []
      },
      {
        id: 3,
        parentId: 0,
        name: '数据分析',
        path: '/analysis',
        component: 'views/analysis/index',
        icon: 'DataAnalysis',
        permission: 'analysis:view',
        type: '菜单',
        sort: 3,
        hidden: false,
        status: 'enabled',
        children: []
      },
      {
        id: 4,
        parentId: 0,
        name: '告警管理',
        path: '/alarms',
        component: 'views/alarms/index',
        icon: 'Alarm',
        permission: 'alarm:view',
        type: '菜单',
        sort: 4,
        hidden: false,
        status: 'enabled',
        children: []
      },
      {
        id: 5,
        parentId: 0,
        name: '系统管理',
        path: '/system',
        component: '',
        icon: 'Setting',
        permission: 'system',
        type: '目录',
        sort: 5,
        hidden: false,
        status: 'enabled',
        children: [
          {
            id: 6,
            parentId: 5,
            name: '用户管理',
            path: '/system/users',
            component: 'views/users/index',
            icon: 'User',
            permission: 'user:view',
            type: '菜单',
            sort: 1,
            hidden: false,
            status: 'enabled',
            children: [
              {
                id: 10,
                parentId: 6,
                name: '用户添加',
                path: '',
                component: '',
                icon: '',
                permission: 'user:add',
                type: '按钮',
                sort: 1,
                hidden: false,
                status: 'enabled',
                children: []
              },
              {
                id: 11,
                parentId: 6,
                name: '用户编辑',
                path: '',
                component: '',
                icon: '',
                permission: 'user:edit',
                type: '按钮',
                sort: 2,
                hidden: false,
                status: 'enabled',
                children: []
              },
              {
                id: 12,
                parentId: 6,
                name: '用户删除',
                path: '',
                component: '',
                icon: '',
                permission: 'user:delete',
                type: '按钮',
                sort: 3,
                hidden: false,
                status: 'enabled',
                children: []
              }
            ]
          },
          {
            id: 7,
            parentId: 5,
            name: '角色管理',
            path: '/system/roles',
            component: 'views/roles/index',
            icon: 'User',
            permission: 'role:view',
            type: '菜单',
            sort: 2,
            hidden: false,
            status: 'enabled',
            children: []
          },
          {
            id: 8,
            parentId: 5,
            name: '菜单管理',
            path: '/system/menus',
            component: 'views/menus/index',
            icon: 'Menu',
            permission: 'menu:view',
            type: '菜单',
            sort: 3,
            hidden: false,
            status: 'enabled',
            children: []
          },
          {
            id: 9,
            parentId: 5,
            name: '系统设置',
            path: '/system/settings',
            component: 'views/settings/index',
            icon: 'Setting',
            permission: 'settings:view',
            type: '菜单',
            sort: 4,
            hidden: false,
            status: 'enabled',
            children: []
          }
        ]
      }
    ]
    
    loading.value = false
  }, 500)
}

// 展开所有
const expandAll = () => {
  if (menuTableRef.value) {
    menuList.value.forEach(row => {
      menuTableRef.value.toggleRowExpansion(row, true)
    })
  }
}

// 收起所有
const collapseAll = () => {
  if (menuTableRef.value) {
    menuList.value.forEach(row => {
      menuTableRef.value.toggleRowExpansion(row, false)
    })
  }
}

// 添加菜单
const handleAddMenu = () => {
  dialogType.value = 'add'
  isAddingChild.value = false
  resetMenuForm()
  dialogVisible.value = true
}

// 添加子菜单
const handleAddChild = (row) => {
  dialogType.value = 'add'
  isAddingChild.value = true
  resetMenuForm()
  menuForm.parentId = row.id
  dialogVisible.value = true
}

// 编辑菜单
const handleEdit = (row) => {
  dialogType.value = 'edit'
  isAddingChild.value = false
  
  // 填充表单
  Object.assign(menuForm, {
    id: row.id,
    parentId: row.parentId,
    name: row.name,
    path: row.path,
    component: row.component,
    icon: row.icon,
    permission: row.permission,
    type: row.type,
    sort: row.sort,
    hidden: row.hidden,
    status: row.status
  })
  
  dialogVisible.value = true
}

// 删除菜单
const handleDelete = (row) => {
  if (row.children && row.children.length > 0) {
    ElMessage.warning('该菜单下有子菜单，不能直接删除')
    return
  }
  
  ElMessageBox.confirm(
    `确认删除菜单 ${row.name}?`,
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
        deleteMenuRecursively(menuList.value, row.id)
        ElMessage.success('菜单已删除')
      }, 300)
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 递归删除菜单
const deleteMenuRecursively = (list, id) => {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      list.splice(i, 1)
      return true
    }
    if (list[i].children && list[i].children.length > 0) {
      if (deleteMenuRecursively(list[i].children, id)) {
        return true
      }
    }
  }
  return false
}

// 修改显示状态
const handleVisibleChange = (row) => {
  const visibleText = row.hidden ? '隐藏' : '显示'
  ElMessage.success(`菜单 ${row.name} 已${visibleText}`)
}

// 修改状态
const handleStatusChange = (row) => {
  const statusText = row.status === 'enabled' ? '启用' : '禁用'
  ElMessage.success(`菜单 ${row.name} 已${statusText}`)
}

// 重置表单
const resetMenuForm = () => {
  if (menuFormRef.value) {
    menuFormRef.value.resetFields()
  }
  Object.assign(menuForm, {
    id: '',
    parentId: 0,
    name: '',
    path: '',
    component: '',
    icon: '',
    permission: '',
    type: '菜单',
    sort: 0,
    hidden: false,
    status: 'enabled'
  })
}

// 提交表单
const submitMenuForm = () => {
  if (!menuFormRef.value) return
  
  menuFormRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 添加菜单
        const newMenu = {
          id: new Date().getTime(),
          parentId: menuForm.parentId,
          name: menuForm.name,
          path: menuForm.path,
          component: menuForm.component,
          icon: menuForm.icon,
          permission: menuForm.permission,
          type: menuForm.type,
          sort: menuForm.sort,
          hidden: menuForm.hidden,
          status: menuForm.status,
          children: []
        }
        
        if (menuForm.parentId === 0) {
          // 添加顶级菜单
          menuList.value.push(newMenu)
        } else {
          // 添加子菜单
          addChildMenuRecursively(menuList.value, menuForm.parentId, newMenu)
        }
        
        ElMessage.success('菜单添加成功')
      } else {
        // 编辑菜单
        updateMenuRecursively(menuList.value, menuForm)
        ElMessage.success('菜单更新成功')
      }
      
      dialogVisible.value = false
    }
  })
}

// 递归添加子菜单
const addChildMenuRecursively = (list, parentId, newMenu) => {
  for (const item of list) {
    if (item.id === parentId) {
      if (!item.children) {
        item.children = []
      }
      item.children.push(newMenu)
      return true
    }
    if (item.children && item.children.length > 0) {
      if (addChildMenuRecursively(item.children, parentId, newMenu)) {
        return true
      }
    }
  }
  return false
}

// 递归更新菜单
const updateMenuRecursively = (list, formData) => {
  for (const item of list) {
    if (item.id === formData.id) {
      Object.assign(item, {
        name: formData.name,
        path: formData.path,
        component: formData.component,
        icon: formData.icon,
        permission: formData.permission,
        type: formData.type,
        sort: formData.sort,
        hidden: formData.hidden,
        status: formData.status
      })
      return true
    }
    if (item.children && item.children.length > 0) {
      if (updateMenuRecursively(item.children, formData)) {
        return true
      }
    }
  }
  return false
}

onMounted(() => {
  getMenuList()
})
</script>

<style scoped>
.menu-management {
  width: 100%;
}

.operation-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

:deep(.el-table__row--level-0) {
  font-weight: bold;
  background-color: #f5f7fa;
}

:deep(.el-table .el-table__row--level-1) {
  font-weight: normal;
}
</style> 