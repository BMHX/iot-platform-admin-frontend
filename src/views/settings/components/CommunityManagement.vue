<template>
  <div class="community-management">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAdd">添加{{ tenantTypeName }}</el-button>
      <el-input
        v-model="searchKeyword"
        :placeholder="`请输入${tenantTypeName}名称`"
        style="width: 300px; margin-left: 20px"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button :icon="Search" @click="handleSearch"></el-button>
        </template>
      </el-input>
    </div>
    
    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="communityList"
      stripe
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" :label="`${tenantTypeName}名称`" />
      <el-table-column prop="address" label="地址" />
      <el-table-column prop="contactPerson" label="联系人" />
      <el-table-column prop="contactPhone" label="联系电话" />
      <el-table-column prop="deviceCount" label="设备数量" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
            {{ scope.row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        :current-page="query.page"
        :page-size="query.limit"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? `添加${tenantTypeName}` : `编辑${tenantTypeName}`"
      width="500px"
    >
      <el-form
        ref="communityFormRef"
        :model="communityForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item :label="`${tenantTypeName}名称`" prop="name">
          <el-input v-model="communityForm.name" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="communityForm.address" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="communityForm.contactPerson" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="communityForm.contactPhone" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="communityForm.status" placeholder="请选择状态">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="communityForm.remark" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getTenantList, addTenant, updateTenant, deleteTenant } from '../../../api/tenant'

// 定义组件接收的属性
const props = defineProps({
  tenantTypeId: {
    type: Number,
    default: null
  },
  tenantTypeName: {
    type: String,
    default: '小区'
  }
})

// 租户类型ID
const communityTypeId = ref(props.tenantTypeId)

// 查询参数
const query = reactive({
  page: 1,
  limit: 10,
  name: '',
  typeId: props.tenantTypeId // 使用传入的租户类型ID
})

// 列表数据
const loading = ref(false)
const communityList = ref([])
const total = ref(0)
const searchKeyword = ref('')

// 对话框数据
const dialogVisible = ref(false)
const dialogType = ref('add')
const communityFormRef = ref(null)
const communityForm = reactive({
  id: null,
  typeId: props.tenantTypeId, // 使用传入的租户类型ID
  name: '',
  address: '',
  contactPerson: '',
  contactPhone: '',
  status: 'active',
  remark: '',
  regionCode: ''
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: `请输入${props.tenantTypeName}名称`, trigger: 'blur' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  contactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 获取小区列表
const getCommunityList = () => {
  if (!communityTypeId.value) {
    communityList.value = []
    total.value = 0
    return
  }
  
  loading.value = true
  // 调用租户API获取小区类型的租户
  getTenantList({
    ...query,
    typeId: communityTypeId.value // 确保使用最新的租户类型ID
  }).then(res => {
    if (res.code === 0 || res.code === 200) {
      // 处理返回的数据格式，适配前端显示
      const list = (res.data.list || []).map(item => ({
        ...item,
        // 确保状态字段格式一致
        status: item.status || 'active',
        // 如果后端返回的设备数量为null，则显示为0
        deviceCount: item.deviceCount || 0,
        // 初始化属性对象
        attributes: {}
      }))
      
      // 获取每个租户的属性值
      Promise.all(list.map(tenant => loadTenantAttributes(tenant)))
        .then(() => {
          communityList.value = list
          total.value = res.data.total || 0
          loading.value = false
        })
        .catch(err => {
          console.error('获取租户属性值失败:', err)
          communityList.value = list
          total.value = res.data.total || 0
          loading.value = false
        })
    } else {
      ElMessage.error(res.message || `获取${props.tenantTypeName}列表失败`)
      loading.value = false
    }
  }).catch(err => {
    console.error(`获取${props.tenantTypeName}列表失败:`, err)
    ElMessage.error(`获取${props.tenantTypeName}列表失败`)
    loading.value = false
    
    // 如果API调用失败，使用模拟数据
    useMockData()
  })
}

// 使用模拟数据
const useMockData = () => {
  // 模拟数据
  const mockData = Array(15).fill(0).map((_, index) => {
    return {
      id: index + 1,
      typeId: communityTypeId.value,
      name: `测试${props.tenantTypeName}${index + 1}`,
      address: `测试地址${index + 1}`,
      contactPerson: `联系人${index + 1}`,
      contactPhone: `1379999${String(index + 1).padStart(4, '0')}`,
      status: index % 3 === 0 ? 'inactive' : 'active',
      deviceCount: Math.floor(Math.random() * 100),
      remark: `这是测试${props.tenantTypeName}${index + 1}的备注信息`
    }
  })
  
  // 分页处理
  const start = (query.page - 1) * query.limit
  const end = start + query.limit
  communityList.value = mockData.slice(start, end)
  total.value = mockData.length
  
  loading.value = false
}

// 监听属性变化
watch(() => props.tenantTypeId, (newVal) => {
  if (newVal) {
    communityTypeId.value = newVal
    query.typeId = newVal
    communityForm.typeId = newVal
    getCommunityList()
  } else {
    // 未传入租户类型ID，显示空列表
    communityList.value = []
    total.value = 0
    loading.value = false
  }
}, { immediate: true })

// 搜索
const handleSearch = () => {
  query.page = 1
  query.name = searchKeyword.value
  getCommunityList()
}

// 处理每页条数变化
const handleSizeChange = (val) => {
  query.limit = val
  getCommunityList()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  query.page = val
  getCommunityList()
}

// 添加小区
const handleAdd = () => {
  dialogType.value = 'add'
  communityForm.id = null
  communityForm.typeId = communityTypeId.value
  communityForm.name = ''
  communityForm.address = ''
  communityForm.contactPerson = ''
  communityForm.contactPhone = ''
  communityForm.status = 'active'
  communityForm.remark = ''
  communityForm.regionCode = ''
  dialogVisible.value = true
}

// 编辑小区
const handleEdit = (row) => {
  dialogType.value = 'edit'
  communityForm.id = row.id
  communityForm.typeId = row.typeId || communityTypeId.value
  communityForm.name = row.name
  communityForm.address = row.address
  communityForm.contactPerson = row.contactPerson
  communityForm.contactPhone = row.contactPhone
  communityForm.status = row.status || 'active'
  communityForm.remark = row.remark || ''
  communityForm.regionCode = row.regionCode || ''
  dialogVisible.value = true
}

// 删除小区
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除${props.tenantTypeName}"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 调用删除API
    deleteTenant([row.id]).then(res => {
      if (res.code === 0 || res.code === 200) {
        ElMessage.success('删除成功')
        getCommunityList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    }).catch(err => {
      console.error(`删除${props.tenantTypeName}失败:`, err)
      ElMessage.error('删除失败')
      
      // 模拟删除成功
      ElMessage.success('模拟删除成功')
      getCommunityList()
    })
  }).catch(() => {
    // 取消删除
  })
}

// 提交表单
const submitForm = () => {
  if (!communityFormRef.value) return
  
  communityFormRef.value.validate((valid) => {
    if (valid) {
      const apiCall = dialogType.value === 'add' 
        ? addTenant(communityForm)
        : updateTenant(communityForm.id, communityForm)
      
      apiCall.then(res => {
        if (res.code === 0 || res.code === 200) {
          ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
          dialogVisible.value = false
          getCommunityList()
        } else {
          ElMessage.error(res.message || (dialogType.value === 'add' ? '添加失败' : '修改失败'))
        }
      }).catch(err => {
        console.error(dialogType.value === 'add' ? `添加${props.tenantTypeName}失败:` : `修改${props.tenantTypeName}失败:`, err)
        ElMessage.error(dialogType.value === 'add' ? '添加失败' : '修改失败')
        
        // 模拟成功
        ElMessage.success(dialogType.value === 'add' ? '模拟添加成功' : '模拟修改成功')
        dialogVisible.value = false
        getCommunityList()
      })
    }
  })
}

// 初始化
onMounted(() => {
  if (communityTypeId.value) {
    getCommunityList()
  }
})
</script>

<style scoped>
.community-management {
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