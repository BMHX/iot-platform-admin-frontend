<template>
  <div class="tenants-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>租户管理</span>
          <el-button type="primary" @click="showTenantTypeDialog">管理租户类型</el-button>
        </div>
      </template>
      
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated />
            </div>
        
      <el-tabs v-else type="border-card">
        <el-tab-pane v-for="type in tenantTypes" :key="type.id">
          <template #label>
            <div class="custom-tabs-label">
              <el-icon>
                <component :is="getIconByType(type.name)" />
              </el-icon>
              <span>{{ type.name }}</span>
            </div>
          </template>
        
          <!-- 根据租户类型动态加载对应的组件 -->
          <component 
            :is="getComponentByType(type.name)" 
            :tenant-type-id="type.id"
            :tenant-type-name="type.name"
          />
        </el-tab-pane>
      </el-tabs>
      
      <!-- 无租户类型数据时显示 -->
      <el-empty v-if="!loading && tenantTypes.length === 0" description="暂无租户类型数据">
        <el-button type="primary" @click="showTenantTypeDialog">添加租户类型</el-button>
      </el-empty>
    </el-card>
    
    <!-- 租户类型管理对话框 -->
    <el-dialog
      v-model="tenantTypeDialogVisible"
      title="租户类型管理"
      width="800px"
    >
      <div class="tenant-type-management">
        <!-- 操作栏 -->
        <div class="operation-bar">
          <el-button type="primary" @click="handleAddTenantType">添加租户类型</el-button>
          <el-input
            v-model="tenantTypeSearchKeyword"
            placeholder="请输入租户类型名称"
            style="width: 300px; margin-left: 20px"
            clearable
            @keyup.enter="handleTenantTypeSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleTenantTypeSearch"></el-button>
            </template>
          </el-input>
        </div>
        
        <!-- 表格 -->
        <el-table
          v-loading="tenantTypeLoading"
          :data="tenantTypeList"
          stripe
          style="width: 100%; margin-top: 20px"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="类型名称" />
          <el-table-column prop="code" label="类型编码" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="handleEditTenantType(scope.row)">编辑</el-button>
              <el-button
                size="small"
                type="danger"
                @click="handleDeleteTenantType(scope.row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            :current-page="tenantTypeQuery.page"
            :page-size="tenantTypeQuery.limit"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="tenantTypeTotal"
            @size-change="handleTenantTypeSizeChange"
            @current-change="handleTenantTypeCurrentChange"
          />
        </div>
      </div>
      
      <!-- 租户类型表单对话框 -->
      <el-dialog
        v-model="tenantTypeFormDialogVisible"
        :title="tenantTypeFormType === 'add' ? '添加租户类型' : '编辑租户类型'"
        width="500px"
        append-to-body
      >
        <el-form
          ref="tenantTypeFormRef"
          :model="tenantTypeForm"
          :rules="tenantTypeRules"
          label-width="100px"
        >
          <el-form-item label="类型名称" prop="name">
            <el-input v-model="tenantTypeForm.name" />
          </el-form-item>
          <el-form-item label="类型编码" prop="code">
            <el-input v-model="tenantTypeForm.code" placeholder="请输入英文编码，如school, hospital" />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input v-model="tenantTypeForm.description" type="textarea" rows="3" />
          </el-form-item>
          <el-form-item label="图标" prop="icon">
            <el-select v-model="tenantTypeForm.icon" placeholder="请选择图标">
              <el-option label="学校" value="School" />
              <el-option label="医院" value="FirstAidKit" />
              <el-option label="企业" value="OfficeBuilding" />
              <el-option label="政府" value="Management" />
              <el-option label="小区" value="House" />
              <el-option label="驿站" value="Location" />
              <el-option label="商场" value="Shop" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="tenantTypeFormDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitTenantTypeForm">确认</el-button>
          </span>
        </template>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, markRaw, reactive } from 'vue'
import SchoolManagement from '../settings/components/SchoolManagement.vue'
import CommunityManagement from '../settings/components/CommunityManagement.vue'
import StationManagement from '../settings/components/StationManagement.vue'
import { 
  School, House, Location, OfficeBuilding, Shop, 
  FirstAidKit, Management, Search 
} from '@element-plus/icons-vue'
import { 
  getTenantTypeList, addTenantType, updateTenantType, deleteTenantType 
} from '../../api/tenant'
import { ElMessage, ElMessageBox } from 'element-plus'

// 租户类型列表
const tenantTypes = ref([])
const loading = ref(true)

// 获取租户类型列表
const fetchTenantTypes = async () => {
  loading.value = true
  try {
    const res = await getTenantTypeList({ page: 1, limit: 100 })
    if (res.code === 0 || res.code === 200) {
      tenantTypes.value = res.data.list || []
    } else {
      ElMessage.error(res.message || '获取租户类型失败')
      // 使用模拟数据
      useMockData()
    }
  } catch (err) {
    console.error('获取租户类型失败:', err)
    // 使用模拟数据
    useMockData()
  } finally {
    loading.value = false
  }
}

// 使用模拟数据
const useMockData = () => {
  tenantTypes.value = [
    { id: 1, name: '学校', code: 'school', icon: 'School' },
    { id: 2, name: '小区', code: 'community', icon: 'House' },
    { id: 3, name: '驿站', code: 'station', icon: 'Location' },
    { id: 4, name: '医院', code: 'hospital', icon: 'FirstAidKit' },
    { id: 5, name: '企业', code: 'company', icon: 'OfficeBuilding' },
    { id: 6, name: '政府机构', code: 'government', icon: 'Management' }
  ]
}

// 根据租户类型名称获取对应的图标组件
const getIconByType = (typeName) => {
  if (typeName.includes('学校')) return School
  if (typeName.includes('小区')) return House
  if (typeName.includes('驿站')) return Location
  if (typeName.includes('医院')) return FirstAidKit
  if (typeName.includes('企业')) return OfficeBuilding
  if (typeName.includes('政府')) return Management
  if (typeName.includes('商场') || typeName.includes('商店')) return Shop
  // 默认图标
  return OfficeBuilding
}

// 根据租户类型名称获取对应的管理组件
const getComponentByType = (typeName) => {
  if (typeName.includes('小区')) return markRaw(CommunityManagement)
  if (typeName.includes('驿站')) return markRaw(StationManagement)
  // 默认使用学校管理组件
  return markRaw(SchoolManagement)
}

// 租户类型管理对话框
const tenantTypeDialogVisible = ref(false)
const tenantTypeLoading = ref(false)
const tenantTypeList = ref([])
const tenantTypeTotal = ref(0)
const tenantTypeSearchKeyword = ref('')

// 租户类型查询参数
const tenantTypeQuery = reactive({
  page: 1,
  limit: 10,
  name: ''
})

// 显示租户类型管理对话框
const showTenantTypeDialog = () => {
  tenantTypeDialogVisible.value = true
  fetchTenantTypeList()
}

// 获取租户类型列表（分页）
const fetchTenantTypeList = async () => {
  tenantTypeLoading.value = true
  try {
    const res = await getTenantTypeList(tenantTypeQuery)
    if (res.code === 0 || res.code === 200) {
      tenantTypeList.value = res.data.list || []
      tenantTypeTotal.value = res.data.total || 0
    } else {
      ElMessage.error(res.message || '获取租户类型列表失败')
      // 使用模拟数据
      useMockTenantTypeData()
    }
  } catch (err) {
    console.error('获取租户类型列表失败:', err)
    // 使用模拟数据
    useMockTenantTypeData()
  } finally {
    tenantTypeLoading.value = false
  }
}

// 使用模拟租户类型数据
const useMockTenantTypeData = () => {
  const mockData = [
    { id: 1, name: '学校', code: 'school', description: '教育机构', icon: 'School', createTime: '2023-06-01 12:00:00' },
    { id: 2, name: '小区', code: 'community', description: '住宅区', icon: 'House', createTime: '2023-06-01 12:00:00' },
    { id: 3, name: '驿站', code: 'station', description: '物流驿站', icon: 'Location', createTime: '2023-06-01 12:00:00' },
    { id: 4, name: '医院', code: 'hospital', description: '医疗机构', icon: 'FirstAidKit', createTime: '2023-06-01 12:00:00' },
    { id: 5, name: '企业', code: 'company', description: '企业单位', icon: 'OfficeBuilding', createTime: '2023-06-01 12:00:00' },
    { id: 6, name: '政府机构', code: 'government', description: '政府部门', icon: 'Management', createTime: '2023-06-01 12:00:00' }
  ]
  
  // 分页处理
  const start = (tenantTypeQuery.page - 1) * tenantTypeQuery.limit
  const end = start + tenantTypeQuery.limit
  tenantTypeList.value = mockData.slice(start, end)
  tenantTypeTotal.value = mockData.length
}

// 租户类型搜索
const handleTenantTypeSearch = () => {
  tenantTypeQuery.page = 1
  tenantTypeQuery.name = tenantTypeSearchKeyword.value
  fetchTenantTypeList()
}

// 处理租户类型每页条数变化
const handleTenantTypeSizeChange = (val) => {
  tenantTypeQuery.limit = val
  fetchTenantTypeList()
}

// 处理租户类型页码变化
const handleTenantTypeCurrentChange = (val) => {
  tenantTypeQuery.page = val
  fetchTenantTypeList()
}

// 租户类型表单对话框
const tenantTypeFormDialogVisible = ref(false)
const tenantTypeFormType = ref('add')
const tenantTypeFormRef = ref(null)
const tenantTypeForm = reactive({
  id: null,
  name: '',
  code: '',
  description: '',
  icon: 'OfficeBuilding'
})

// 租户类型表单验证规则
const tenantTypeRules = {
  name: [{ required: true, message: '请输入租户类型名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入英文编码，如school, hospital', trigger: 'blur' }],
  icon: [{ required: true, message: '请选择图标', trigger: 'change' }]
}

// 添加租户类型
const handleAddTenantType = () => {
  tenantTypeFormType.value = 'add'
  tenantTypeForm.id = null
  tenantTypeForm.name = ''
  tenantTypeForm.code = ''
  tenantTypeForm.description = ''
  tenantTypeForm.icon = 'OfficeBuilding'
  tenantTypeFormDialogVisible.value = true
}

// 编辑租户类型
const handleEditTenantType = (row) => {
  tenantTypeFormType.value = 'edit'
  tenantTypeForm.id = row.id
  tenantTypeForm.name = row.name
  tenantTypeForm.code = row.code || ''
  tenantTypeForm.description = row.description || ''
  tenantTypeForm.icon = row.icon || 'OfficeBuilding'
  tenantTypeFormDialogVisible.value = true
}

// 删除租户类型
const handleDeleteTenantType = (row) => {
  ElMessageBox.confirm(`确定要删除租户类型"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 调用删除API
    deleteTenantType([row.id]).then(res => {
      if (res.code === 0 || res.code === 200) {
        ElMessage.success('删除成功')
        fetchTenantTypeList()
        fetchTenantTypes() // 刷新主页面的租户类型列表
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    }).catch(err => {
      console.error('删除租户类型失败:', err)
      ElMessage.error('删除失败')
      
      // 模拟删除成功
      ElMessage.success('模拟删除成功')
      fetchTenantTypeList()
      fetchTenantTypes() // 刷新主页面的租户类型列表
    })
  }).catch(() => {
    // 取消删除
  })
}

// 提交租户类型表单
const submitTenantTypeForm = () => {
  if (!tenantTypeFormRef.value) return
  
  tenantTypeFormRef.value.validate((valid) => {
    if (valid) {
      // 准备提交的数据，确保包含所有必要字段
      const submitData = {
        ...tenantTypeForm,
        status: tenantTypeForm.status || 'active' // 确保状态字段有值
      }
      
      const apiCall = tenantTypeFormType.value === 'add' 
        ? addTenantType(submitData)
        : updateTenantType(submitData.id, submitData)
      
      apiCall.then(res => {
        if (res.code === 0 || res.code === 200) {
          ElMessage.success(tenantTypeFormType.value === 'add' ? '添加成功' : '修改成功')
          tenantTypeFormDialogVisible.value = false
          fetchTenantTypeList()
          fetchTenantTypes() // 刷新主页面的租户类型列表
        } else {
          ElMessage.error(res.message || (tenantTypeFormType.value === 'add' ? '添加失败' : '修改失败'))
        }
      }).catch(err => {
        console.error(tenantTypeFormType.value === 'add' ? '添加租户类型失败:' : '修改租户类型失败:', err)
        ElMessage.error(tenantTypeFormType.value === 'add' ? '添加失败' : '修改失败')
        
        // 模拟成功
        ElMessage.success(tenantTypeFormType.value === 'add' ? '模拟添加成功' : '模拟修改成功')
        tenantTypeFormDialogVisible.value = false
        fetchTenantTypeList()
        fetchTenantTypes() // 刷新主页面的租户类型列表
      })
    }
  })
}

// 初始化
onMounted(() => {
  fetchTenantTypes()
})
</script>

<style scoped>
.tenants-container {
  padding: 20px;
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-tabs-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

:deep(.el-tabs__content) {
  padding: 20px;
}

.loading-container {
  padding: 20px;
}

.tenant-type-management {
  width: 100%;
}

.operation-bar {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 