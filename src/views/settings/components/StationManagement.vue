<template>
  <div class="station-management">
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
      :data="stationList"
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
        ref="stationFormRef"
        :model="stationForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item :label="`${tenantTypeName}名称`" prop="name">
          <el-input v-model="stationForm.name" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="stationForm.address" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="stationForm.contactPerson" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="stationForm.contactPhone" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="stationForm.status" placeholder="请选择状态">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="stationForm.remark" type="textarea" rows="3" />
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
    default: '驿站'
  }
})

// 租户类型ID
const stationTypeId = ref(props.tenantTypeId)

// 查询参数
const query = reactive({
  page: 1,
  limit: 10,
  name: '',
  typeId: props.tenantTypeId // 使用传入的租户类型ID
})

// 列表数据
const loading = ref(false)
const stationList = ref([])
const total = ref(0)
const searchKeyword = ref('')

// 对话框数据
const dialogVisible = ref(false)
const dialogType = ref('add')
const stationFormRef = ref(null)
const stationForm = reactive({
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

// 获取驿站列表
const getStationList = () => {
  if (!stationTypeId.value) {
    stationList.value = []
    total.value = 0
    return
  }
  
  loading.value = true
  // 调用租户API获取驿站类型的租户
  getTenantList(query).then(res => {
    if (res.code === 0 || res.code === 200) {
      stationList.value = res.data.list || []
      total.value = res.data.total || 0
    } else {
      ElMessage.error(res.message || `获取${props.tenantTypeName}列表失败`)
    }
    loading.value = false
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
      typeId: stationTypeId.value,
      name: `测试${props.tenantTypeName}${index + 1}`,
      address: `测试地址${index + 1}`,
      contactPerson: `联系人${index + 1}`,
      contactPhone: `1369999${String(index + 1).padStart(4, '0')}`,
      status: index % 3 === 0 ? 'inactive' : 'active',
      deviceCount: Math.floor(Math.random() * 100),
      remark: `这是测试${props.tenantTypeName}${index + 1}的备注信息`
    }
  })
  
  // 分页处理
  const start = (query.page - 1) * query.limit
  const end = start + query.limit
  stationList.value = mockData.slice(start, end)
  total.value = mockData.length
  
  loading.value = false
}

// 监听属性变化
watch(() => props.tenantTypeId, (newVal) => {
  if (newVal) {
    stationTypeId.value = newVal
    query.typeId = newVal
    stationForm.typeId = newVal
    getStationList()
  } else {
    // 未传入租户类型ID，显示空列表
    stationList.value = []
    total.value = 0
    loading.value = false
  }
}, { immediate: true })

// 搜索
const handleSearch = () => {
  query.page = 1
  query.name = searchKeyword.value
  getStationList()
}

// 处理每页条数变化
const handleSizeChange = (val) => {
  query.limit = val
  getStationList()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  query.page = val
  getStationList()
}

// 添加驿站
const handleAdd = () => {
  dialogType.value = 'add'
  stationForm.id = null
  stationForm.typeId = stationTypeId.value
  stationForm.name = ''
  stationForm.address = ''
  stationForm.contactPerson = ''
  stationForm.contactPhone = ''
  stationForm.status = 'active'
  stationForm.remark = ''
  stationForm.regionCode = ''
  dialogVisible.value = true
}

// 编辑驿站
const handleEdit = (row) => {
  dialogType.value = 'edit'
  stationForm.id = row.id
  stationForm.typeId = row.typeId || stationTypeId.value
  stationForm.name = row.name
  stationForm.address = row.address
  stationForm.contactPerson = row.contactPerson
  stationForm.contactPhone = row.contactPhone
  stationForm.status = row.status || 'active'
  stationForm.remark = row.remark || ''
  stationForm.regionCode = row.regionCode || ''
  dialogVisible.value = true
}

// 删除驿站
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
        getStationList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    }).catch(err => {
      console.error(`删除${props.tenantTypeName}失败:`, err)
      ElMessage.error('删除失败')
      
      // 模拟删除成功
      ElMessage.success('模拟删除成功')
      getStationList()
    })
  }).catch(() => {
    // 取消删除
  })
}

// 提交表单
const submitForm = () => {
  if (!stationFormRef.value) return
  
  stationFormRef.value.validate((valid) => {
    if (valid) {
      const apiCall = dialogType.value === 'add' 
        ? addTenant(stationForm)
        : updateTenant(stationForm.id, stationForm)
      
      apiCall.then(res => {
        if (res.code === 0 || res.code === 200) {
          ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
          dialogVisible.value = false
          getStationList()
        } else {
          ElMessage.error(res.message || (dialogType.value === 'add' ? '添加失败' : '修改失败'))
        }
      }).catch(err => {
        console.error(dialogType.value === 'add' ? `添加${props.tenantTypeName}失败:` : `修改${props.tenantTypeName}失败:`, err)
        ElMessage.error(dialogType.value === 'add' ? '添加失败' : '修改失败')
        
        // 模拟成功
        ElMessage.success(dialogType.value === 'add' ? '模拟添加成功' : '模拟修改成功')
        dialogVisible.value = false
        getStationList()
      })
    }
  })
}

// 初始化
onMounted(() => {
  if (stationTypeId.value) {
    getStationList()
  }
})
</script>

<style scoped>
.station-management {
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