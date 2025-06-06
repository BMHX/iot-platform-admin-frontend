<template>
  <div class="permission-management">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAddPermissionPackage">新建权限套餐</el-button>
      <el-input
        v-model="searchKeyword"
        placeholder="请输入套餐名称搜索"
        style="width: 300px; margin-left: 20px"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button :icon="Search" @click="handleSearch"></el-button>
        </template>
      </el-input>
    </div>

    <!-- 权限套餐列表 -->
    <el-table
      :data="permissionPackageList"
      border
      style="width: 100%; margin-top: 15px"
      v-loading="loading"
      row-key="id"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="permissionName" label="套餐名称" width="180" />
      <el-table-column prop="price" label="价格" width="120">
        <template #default="scope">
          {{ scope.row.price }} 元
        </template>
      </el-table-column>
      <el-table-column prop="card" label="包含权限" min-width="240">
        <template #default="scope">
          <el-tag
            v-for="(id, index) in parsePermissionIds(scope.row.card)"
            :key="index"
            type="success"
            style="margin-right: 5px; margin-bottom: 5px"
          >
            {{ getPermissionName(id) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
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

    <!-- 添加/编辑权限套餐对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新建权限套餐' : '编辑权限套餐'"
      width="700px"
    >
      <el-form
        :model="packageForm"
        label-width="100px"
        :rules="rules"
        ref="packageFormRef"
      >
        <el-form-item label="套餐名称" prop="permissionName">
          <el-input v-model="packageForm.permissionName" placeholder="请输入套餐名称" />
        </el-form-item>
        <el-form-item label="套餐价格" prop="price">
          <el-input-number v-model="packageForm.price" :min="0" :precision="0" :step="100" style="width: 200px" />
          <span class="unit">元</span>
        </el-form-item>
        <el-form-item label="包含权限" prop="permissionIds">
          <el-transfer
            v-model="packageForm.permissionIds"
            :data="allPermissions"
            :titles="['可选权限', '已选权限']"
            :props="{ 
              key: 'id',
              label: 'name'
            }"
            filterable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPackageForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 权限列表管理对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="基础权限管理"
      width="800px"
    >
      <div class="permission-list-header">
        <el-button type="primary" @click="handleAddPermission">添加权限</el-button>
      </div>
      
      <el-table
        :data="permissionList"
        border
        style="width: 100%; margin-top: 15px"
        v-loading="permissionLoading"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="权限名称" width="180" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleEditPermission(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDeletePermission(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 添加/编辑权限表单 -->
      <el-dialog
        v-model="permissionFormDialogVisible"
        :title="permissionDialogType === 'add' ? '添加权限' : '编辑权限'"
        width="500px"
        append-to-body
      >
        <el-form
          :model="permissionForm"
          label-width="100px"
          :rules="permissionRules"
          ref="permissionFormRef"
        >
          <el-form-item label="权限名称" prop="name">
            <el-input v-model="permissionForm.name" />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input v-model="permissionForm.description" type="textarea" :rows="3" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="permissionFormDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitPermissionForm">确认</el-button>
          </span>
        </template>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import {
  getPermissionList, getAllPermissions, addPermission, updatePermission, deletePermission,
  getPricesList, getAllPrices, getPricesDetail, addPrices, updatePrices, deletePrices
} from '../../../api/permission'

// 权限套餐列表数据
const loading = ref(false)
const permissionPackageList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')

// 基础权限列表数据
const permissionList = ref([])
const permissionLoading = ref(false)
const allPermissions = ref([])

// 权限套餐对话框
const dialogVisible = ref(false)
const dialogType = ref('add') // add 或 edit
const packageFormRef = ref(null)
const packageForm = reactive({
  id: null,
  permissionName: '',
  price: 0,
  permissionIds: []
})

// 权限表单验证规则
const rules = {
  permissionName: [
    { required: true, message: '请输入套餐名称', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入套餐价格', trigger: 'blur' }
  ],
  permissionIds: [
    { required: true, message: '请选择包含的权限', trigger: 'change', type: 'array' }
  ]
}

// 权限列表管理对话框
const permissionDialogVisible = ref(false)
const permissionFormDialogVisible = ref(false)
const permissionDialogType = ref('add')
const permissionFormRef = ref(null)
const permissionForm = reactive({
  id: null,
  name: '',
  description: ''
})

// 权限表单验证规则
const permissionRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' }
  ]
}

// 获取权限套餐列表
const fetchPermissionPackages = () => {
  loading.value = true
  console.log('开始获取权限套餐列表, 当前页码:', currentPage.value, '每页条数:', pageSize.value)
  
  // 调用API获取权限套餐列表
  getPricesList({
    page: currentPage.value,
    limit: pageSize.value,
    permissionName: searchKeyword.value
  }).then(res => {
    console.log('获取权限套餐列表成功:', res)
    if (res.code === 0 || res.code === 200) {
      // 处理后端返回的数据
      permissionPackageList.value = res.data.list || []
      total.value = res.data.total || 0
    } else {
      ElMessage.error(res.message || '获取权限套餐列表失败')
      useMockData()
    }
  }).catch(err => {
    console.error('获取权限套餐列表失败:', err)
    ElMessage.error('获取权限套餐列表失败')
    useMockData()
  }).finally(() => {
    loading.value = false
  })
}

// 获取所有基础权限列表
const fetchAllPermissions = () => {
  permissionLoading.value = true
  
  getAllPermissions().then(res => {
    if (res.code === 0 || res.code === 200) {
      permissionList.value = res.data || []
      // 转换为transfer组件需要的格式
      allPermissions.value = (res.data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description
      }))
  } else {
      ElMessage.error(res.message || '获取权限列表失败')
      useMockPermissionData()
    }
  }).catch(err => {
    console.error('获取权限列表失败:', err)
    ElMessage.error('获取权限列表失败')
    useMockPermissionData()
  }).finally(() => {
    permissionLoading.value = false
  })
}

// 使用模拟权限套餐数据
const useMockData = () => {
  permissionPackageList.value = [
        {
          id: 1,
      permissionName: '基础套餐',
      price: 199,
      card: '[1,2,3]'
        },
        {
          id: 2,
      permissionName: '标准套餐',
      price: 499,
      card: '[1,2,3,4,5]'
        },
        {
          id: 3,
      permissionName: '高级套餐',
      price: 999,
      card: '[1,2,3,4,5,6,7]'
        },
        {
          id: 4,
      permissionName: '企业套餐',
      price: 1999,
      card: '[1,2,3,4,5,6,7,8,9,10]'
    }
  ]
  
  total.value = permissionPackageList.value.length
}

// 使用模拟权限数据
const useMockPermissionData = () => {
      permissionList.value = [
    { id: 1, name: '个人中心', description: '访问个人中心页面' },
    { id: 2, name: '设备管理', description: '管理设备列表' },
    { id: 3, name: '数据查看', description: '查看设备数据' },
    { id: 4, name: '用户管理', description: '管理子用户' },
    { id: 5, name: '告警设置', description: '设置设备告警规则' },
    { id: 6, name: '设备分组', description: '对设备进行分组管理' },
    { id: 7, name: '数据分析', description: '查看设备数据分析报表' },
    { id: 8, name: '接口调用', description: '允许API接口调用' },
    { id: 9, name: '自动化规则', description: '设置设备联动规则' },
    { id: 10, name: '数据导出', description: '导出设备历史数据' }
  ]
  
  // 转换为transfer组件需要的格式
  allPermissions.value = permissionList.value.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description
  }))
}

// 解析权限ID字符串
const parsePermissionIds = (cardStr) => {
  if (!cardStr) return []
  try {
    // 处理PostgreSQL风格的数组字符串 "{1,2,3,4}"
    if (typeof cardStr === 'string' && cardStr.startsWith('{') && cardStr.endsWith('}')) {
      // 移除花括号，并按逗号分隔
      const content = cardStr.substring(1, cardStr.length - 1)
      return content.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
    }
    
    // 尝试直接解析JSON
    try {
      return JSON.parse(cardStr)
    } catch (e) {
      // 尝试替换单引号为双引号后解析
      try {
        return JSON.parse(cardStr.replace(/'/g, '"'))
      } catch (e2) {
        // 如果是字符串形式的数组 "[1,2,3]"，尝试解析
        if (typeof cardStr === 'string' && cardStr.trim().startsWith('[') && cardStr.trim().endsWith(']')) {
          try {
            return JSON.parse(cardStr.trim())
          } catch (e3) {
            console.error('解析权限ID失败 - 尝试方法3:', e3)
          }
        }
        
        // 如果是逗号分隔的字符串，尝试拆分
        if (typeof cardStr === 'string' && cardStr.includes(',')) {
          try {
            return cardStr.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
          } catch (e4) {
            console.error('解析权限ID失败 - 尝试方法4:', e4)
          }
        }
        
        // 如果是单个数字或字符串
        if (!isNaN(cardStr)) {
          return [Number(cardStr)]
        }
        
        console.error('解析权限ID失败 - 所有方法:', e2)
        return []
      }
    }
  } catch (e) {
    console.error('解析权限ID失败:', e, '原始字符串:', cardStr)
    return []
  }
}

// 根据权限ID获取权限名称
const getPermissionName = (id) => {
  const permission = allPermissions.value.find(item => item.id == id)
  return permission ? permission.name : `权限${id}`
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchPermissionPackages()
}

// 分页
const handleSizeChange = (size) => {
  pageSize.value = size
  fetchPermissionPackages()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchPermissionPackages()
}

// 添加权限套餐
const handleAddPermissionPackage = () => {
  dialogType.value = 'add'
  packageForm.id = null
  packageForm.permissionName = ''
  packageForm.price = 0
  packageForm.permissionIds = []
  dialogVisible.value = true
  
  // 确保有权限数据可供选择
  if (allPermissions.value.length === 0) {
    fetchAllPermissions()
  }
}

// 编辑权限套餐
const handleEdit = (row) => {
  dialogType.value = 'edit'
  packageForm.id = row.id
  packageForm.permissionName = row.permissionName
  packageForm.price = row.price
  packageForm.permissionIds = parsePermissionIds(row.card)
  
  dialogVisible.value = true
  
  // 确保有权限数据可供选择
  if (allPermissions.value.length === 0) {
    fetchAllPermissions()
  }
}

// 删除权限套餐
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除权限套餐 "${row.permissionName}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deletePrices(row.id).then(res => {
      if (res.code === 0 || res.code === 200) {
    ElMessage.success('删除成功')
        fetchPermissionPackages()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    }).catch(err => {
      console.error('删除权限套餐失败:', err)
      ElMessage.error('删除失败')
      
      // 模拟删除成功
      permissionPackageList.value = permissionPackageList.value.filter(item => item.id !== row.id)
      ElMessage.success('模拟删除成功')
    })
  }).catch(() => {})
}

// 提交权限套餐表单
const submitPackageForm = () => {
  packageFormRef.value.validate((valid) => {
    if (valid) {
      // 准备提交的数据
      const submitData = {
        permissionName: packageForm.permissionName,
        price: packageForm.price,
        // 将权限ID数组格式化为PostgreSQL风格的字符串 {1,2,3}
        card: `{${packageForm.permissionIds.join(',')}}`
      }
      
      if (dialogType.value === 'edit') {
        submitData.id = packageForm.id
      }
      
      console.log('准备提交权限套餐表单:', submitData, '操作类型:', dialogType.value)
      
      const apiCall = dialogType.value === 'add' 
        ? addPrices(submitData)
        : updatePrices(submitData)
      
      apiCall.then(res => {
        if (res.code === 0 || res.code === 200) {
          ElMessage.success(dialogType.value === 'add' ? '添加权限套餐成功' : '编辑权限套餐成功')
          dialogVisible.value = false
          fetchPermissionPackages()
        } else {
          ElMessage.error(res.message || res.msg || (dialogType.value === 'add' ? '添加权限套餐失败' : '编辑权限套餐失败'))
        }
      }).catch(err => {
        console.error(dialogType.value === 'add' ? '添加权限套餐失败:' : '编辑权限套餐失败:', err)
        ElMessage.error(dialogType.value === 'add' ? '添加权限套餐失败' : '编辑权限套餐失败')
        
        // 模拟成功
        ElMessage.success(dialogType.value === 'add' ? '模拟添加权限套餐成功' : '模拟编辑权限套餐成功')
        dialogVisible.value = false
        
        if (dialogType.value === 'add') {
          const newPackage = {
            id: Date.now(),
            permissionName: packageForm.permissionName,
            price: packageForm.price,
            card: `{${packageForm.permissionIds.join(',')}}`
          }
          permissionPackageList.value.unshift(newPackage)
        } else {
          const index = permissionPackageList.value.findIndex(item => item.id === packageForm.id)
          if (index !== -1) {
            permissionPackageList.value[index] = {
              ...permissionPackageList.value[index],
              permissionName: packageForm.permissionName,
              price: packageForm.price,
              card: `{${packageForm.permissionIds.join(',')}}`
            }
          }
        }
      })
    }
  })
}

// 打开权限管理对话框
const handleManagePermissions = () => {
  permissionDialogVisible.value = true
  fetchAllPermissions()
}

// 添加基础权限
const handleAddPermission = () => {
  permissionDialogType.value = 'add'
  permissionForm.id = null
  permissionForm.name = ''
  permissionForm.description = ''
  permissionFormDialogVisible.value = true
}

// 编辑基础权限
const handleEditPermission = (row) => {
  permissionDialogType.value = 'edit'
  permissionForm.id = row.id
  permissionForm.name = row.name
  permissionForm.description = row.description
  permissionFormDialogVisible.value = true
}

// 删除基础权限
const handleDeletePermission = (row) => {
  ElMessageBox.confirm(`确定要删除权限 "${row.name}" 吗？删除后可能影响已使用此权限的套餐。`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deletePermission(row.id).then(res => {
      if (res.code === 0 || res.code === 200) {
        ElMessage.success('删除成功')
        fetchAllPermissions()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    }).catch(err => {
      console.error('删除权限失败:', err)
      ElMessage.error('删除失败')
      
      // 模拟删除成功
      permissionList.value = permissionList.value.filter(item => item.id !== row.id)
      allPermissions.value = allPermissions.value.filter(item => item.id !== row.id)
      ElMessage.success('模拟删除成功')
    })
  }).catch(() => {})
}

// 提交基础权限表单
const submitPermissionForm = () => {
  permissionFormRef.value.validate((valid) => {
    if (valid) {
      const submitData = {
        name: permissionForm.name,
        description: permissionForm.description
      }
      
      if (permissionDialogType.value === 'edit') {
        submitData.id = permissionForm.id
      }
      
      const apiCall = permissionDialogType.value === 'add'
        ? addPermission(submitData)
        : updatePermission(submitData)
      
      apiCall.then(res => {
        if (res.code === 0 || res.code === 200) {
          ElMessage.success(permissionDialogType.value === 'add' ? '添加权限成功' : '编辑权限成功')
          permissionFormDialogVisible.value = false
          fetchAllPermissions()
        } else {
          ElMessage.error(res.message || (permissionDialogType.value === 'add' ? '添加权限失败' : '编辑权限失败'))
        }
      }).catch(err => {
        console.error(permissionDialogType.value === 'add' ? '添加权限失败:' : '编辑权限失败:', err)
        ElMessage.error(permissionDialogType.value === 'add' ? '添加权限失败' : '编辑权限失败')
        
        // 模拟成功
        if (permissionDialogType.value === 'add') {
        const newPermission = {
          id: Date.now(),
            name: permissionForm.name,
            description: permissionForm.description
        }
          permissionList.value.push(newPermission)
          allPermissions.value.push({
            id: newPermission.id,
            name: newPermission.name,
            description: newPermission.description
          })
      } else {
        const index = permissionList.value.findIndex(item => item.id === permissionForm.id)
        if (index !== -1) {
            permissionList.value[index].name = permissionForm.name
            permissionList.value[index].description = permissionForm.description
            
            const transIndex = allPermissions.value.findIndex(item => item.id === permissionForm.id)
            if (transIndex !== -1) {
              allPermissions.value[transIndex].name = permissionForm.name
              allPermissions.value[transIndex].description = permissionForm.description
            }
          }
        }
        ElMessage.success(permissionDialogType.value === 'add' ? '模拟添加权限成功' : '模拟编辑权限成功')
        permissionFormDialogVisible.value = false
      })
    }
  })
}

onMounted(() => {
  fetchPermissionPackages()
  fetchAllPermissions()
})
</script>

<style scoped>
.permission-management {
  width: 100%;
}

.operation-bar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.unit {
  margin-left: 10px;
}

.permission-list-header {
  margin-bottom: 15px;
}

:deep(.el-transfer) {
  width: 100%;
}

:deep(.el-transfer__buttons) {
  padding: 0 10px;
}

:deep(.el-transfer-panel) {
  width: 45%;
}
</style>