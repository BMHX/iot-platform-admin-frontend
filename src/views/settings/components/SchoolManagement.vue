<template>
  <div class="school-management">
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
      :data="schoolList"
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
        ref="schoolFormRef"
        :model="schoolForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item :label="`${tenantTypeName}名称`" prop="name">
          <el-input v-model="schoolForm.name" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="schoolForm.address" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="schoolForm.contactPerson" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="schoolForm.contactPhone" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="schoolForm.status" placeholder="请选择状态">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="schoolForm.remark" type="textarea" rows="3" />
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
    default: '学校'
  }
})

// 租户类型ID
const schoolTypeId = ref(props.tenantTypeId)

// 查询参数
const query = reactive({
  page: 1,
  limit: 10,
  name: '',
  typeId: props.tenantTypeId // 使用传入的租户类型ID
})

// 列表数据
const loading = ref(false)
const schoolList = ref([])
const total = ref(0)
const searchKeyword = ref('')

// 对话框数据
const dialogVisible = ref(false)
const dialogType = ref('add')
const schoolFormRef = ref(null)
const schoolForm = reactive({
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

// 获取学校列表
const getSchoolList = () => {
  if (!schoolTypeId.value) {
    schoolList.value = []
    total.value = 0
    return
  }
  
  loading.value = true
  // 调用租户API获取学校类型的租户
  getTenantList({
    ...query,
    typeId: schoolTypeId.value // 确保使用最新的租户类型ID
  }).then(res => {
    if (res.code === 0 || res.code === 200) {
      // 处理返回的数据格式，适配前端显示
      schoolList.value = (res.data.list || []).map(item => ({
        ...item,
        // 确保状态字段格式一致
        status: item.status || 'active',
        // 如果后端返回的设备数量为null，则显示为0
        deviceCount: item.deviceCount || 0
      }))
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
      typeId: schoolTypeId.value,
      name: `测试${props.tenantTypeName}${index + 1}`,
      address: `测试地址${index + 1}`,
      contactPerson: `联系人${index + 1}`,
      contactPhone: `1389999${String(index + 1).padStart(4, '0')}`,
      status: index % 3 === 0 ? 'inactive' : 'active',
      deviceCount: Math.floor(Math.random() * 100),
      remark: `这是测试${props.tenantTypeName}${index + 1}的备注信息`
    }
  })
  
  // 分页处理
  const start = (query.page - 1) * query.limit
  const end = start + query.limit
  schoolList.value = mockData.slice(start, end)
  total.value = mockData.length
    
    loading.value = false
}

// 监听属性变化
watch(() => props.tenantTypeId, (newVal) => {
  if (newVal) {
    schoolTypeId.value = newVal
    query.typeId = newVal
    schoolForm.typeId = newVal
    getSchoolList()
  } else {
    // 未传入租户类型ID，显示空列表
    schoolList.value = []
    total.value = 0
    loading.value = false
  }
}, { immediate: true })

// 搜索
const handleSearch = () => {
  query.page = 1
  query.name = searchKeyword.value
  getSchoolList()
}

// 处理每页条数变化
const handleSizeChange = (val) => {
  query.limit = val
  getSchoolList()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  query.page = val
  getSchoolList()
}

// 添加学校
const handleAdd = () => {
  dialogType.value = 'add'
  schoolForm.id = null
  schoolForm.typeId = schoolTypeId.value // 确保使用最新的租户类型ID
  schoolForm.name = ''
  schoolForm.address = ''
  schoolForm.contactPerson = ''
  schoolForm.contactPhone = ''
  schoolForm.status = 'active'
  schoolForm.remark = ''
  schoolForm.regionCode = ''
  dialogVisible.value = true
}

// 编辑学校
const handleEdit = (row) => {
  dialogType.value = 'edit'
  schoolForm.id = row.id
  schoolForm.typeId = row.typeId || schoolTypeId.value
  schoolForm.name = row.name
  schoolForm.address = row.address
  schoolForm.contactPerson = row.contactPerson
  schoolForm.contactPhone = row.contactPhone
  schoolForm.status = row.status || 'active'
  schoolForm.remark = row.remark || ''
  schoolForm.regionCode = row.regionCode || ''
  dialogVisible.value = true
}

// 删除学校
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
        getSchoolList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    }).catch(err => {
      console.error(`删除${props.tenantTypeName}失败:`, err)
      ElMessage.error('删除失败')
      
      // 模拟删除成功
      ElMessage.success('模拟删除成功')
      getSchoolList()
    })
  }).catch(() => {
    // 取消删除
  })
}

// 提交表单
const submitForm = () => {
  if (!schoolFormRef.value) return
  
  schoolFormRef.value.validate((valid) => {
    if (valid) {
      // 确保设置了租户类型ID
      schoolForm.typeId = schoolTypeId.value
      
      // 确保状态字段正确
      if (!schoolForm.status) {
        schoolForm.status = 'active'
      }
      
      // 准备提交的数据
      const submitData = {
        ...schoolForm,
        // 添加任何必要的字段转换
        regionCode: schoolForm.regionCode || ''
      }
      
      console.log(`准备${dialogType.value === 'add' ? '添加' : '修改'}${props.tenantTypeName}:`, submitData)
      
      const apiCall = dialogType.value === 'add' 
        ? addTenant(submitData)
        : updateTenant(submitData)
      
      apiCall.then(res => {
        if (res.code === 0 || res.code === 200) {
          ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
          dialogVisible.value = false
          getSchoolList()
        } else {
          ElMessage.error(res.message || res.msg || (dialogType.value === 'add' ? '添加失败' : '修改失败'))
        }
      }).catch(err => {
        console.error(dialogType.value === 'add' ? `添加${props.tenantTypeName}失败:` : `修改${props.tenantTypeName}失败:`, err)
        ElMessage.error(dialogType.value === 'add' ? '添加失败' : '修改失败')
        
        // 模拟成功
        ElMessage.success(dialogType.value === 'add' ? '模拟添加成功' : '模拟修改成功')
        dialogVisible.value = false
        getSchoolList()
      })
    }
  })
}

// 初始化
onMounted(() => {
  if (schoolTypeId.value) {
  getSchoolList()
  }
})
</script>

<style scoped>
.school-management {
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