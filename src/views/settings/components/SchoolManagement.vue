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
      <!-- 动态属性列 -->
      <el-table-column 
        v-for="attr in displayableAttributes" 
        :key="attr.id" 
        :prop="`attributes.${attr.code}`" 
        :label="attr.name"
        :width="attr.width || 120"
      >
        <template #default="scope">
          {{ getAttributeValue(scope.row, attr) }}
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
        
        <!-- 动态属性表单项 -->
        <div v-for="attr in attributeDefinitions" :key="attr.id">
          <el-form-item :label="attr.name" :prop="`attributes.${attr.code}`">
            <!-- 字符串类型 -->
            <el-input 
              v-if="attr.dataType === 'string'" 
              v-model="schoolForm.attributes[attr.code]" 
              :placeholder="`请输入${attr.name}`"
            />
            
            <!-- 数字类型 -->
            <el-input-number 
              v-else-if="attr.dataType === 'integer' || attr.dataType === 'decimal'" 
              v-model="schoolForm.attributes[attr.code]" 
              :precision="attr.dataType === 'decimal' ? 2 : 0"
              :step="attr.dataType === 'decimal' ? 0.1 : 1"
              :placeholder="`请输入${attr.name}`"
            />
            
            <!-- 布尔类型 -->
            <el-switch 
              v-else-if="attr.dataType === 'boolean'" 
              v-model="schoolForm.attributes[attr.code]" 
            />
            
            <!-- 日期类型 -->
            <el-date-picker 
              v-else-if="attr.dataType === 'date'" 
              v-model="schoolForm.attributes[attr.code]" 
              type="date" 
              :placeholder="`请选择${attr.name}`"
            />
            
            <!-- 日期时间类型 -->
            <el-date-picker 
              v-else-if="attr.dataType === 'datetime'" 
              v-model="schoolForm.attributes[attr.code]" 
              type="datetime" 
              :placeholder="`请选择${attr.name}`"
            />
            
            <!-- 枚举类型 -->
            <el-select 
              v-else-if="attr.dataType === 'enum'" 
              v-model="schoolForm.attributes[attr.code]" 
              :placeholder="`请选择${attr.name}`"
            >
              <el-option 
                v-for="option in parseOptions(attr.options)" 
                :key="option.value" 
                :label="option.label" 
                :value="option.value" 
              />
            </el-select>
            
            <!-- 文本类型 -->
            <el-input 
              v-else-if="attr.dataType === 'text'" 
              v-model="schoolForm.attributes[attr.code]" 
              type="textarea" 
              :rows="3" 
              :placeholder="`请输入${attr.name}`"
            />
            
            <!-- 默认为字符串输入 -->
            <el-input 
              v-else 
              v-model="schoolForm.attributes[attr.code]" 
              :placeholder="`请输入${attr.name}`"
            />
          </el-form-item>
        </div>
        
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
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { 
  getTenantList, 
  addTenant, 
  updateTenant, 
  deleteTenant, 
  getAttributeDefinitionsByTypeId,
  getAttributeValuesByTenantId
} from '../../../api/tenant'

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
  regionCode: '',
  attributes: {} // 存储动态属性值
})

// 属性定义
const attributeDefinitions = ref([])
const attributeLoading = ref(false)

// 可显示在表格中的属性（过滤一些不适合在表格中显示的属性类型）
const displayableAttributes = computed(() => {
  return attributeDefinitions.value.filter(attr => 
    ['string', 'integer', 'decimal', 'enum', 'boolean'].includes(attr.dataType)
  )
})

// 获取属性定义
const fetchAttributeDefinitions = async () => {
  if (!schoolTypeId.value) return
  
  attributeLoading.value = true
  try {
    const res = await getAttributeDefinitionsByTypeId(schoolTypeId.value)
    if (res.code === 0 || res.code === 200) {
      attributeDefinitions.value = res.data || []
    } else {
      console.error('获取属性定义失败:', res.message)
    }
  } catch (err) {
    console.error('获取属性定义错误:', err)
    // 使用模拟数据
    useMockAttributeDefinitions()
  } finally {
    attributeLoading.value = false
  }
}

// 使用模拟属性定义数据
const useMockAttributeDefinitions = () => {
  attributeDefinitions.value = [
    {
      id: 1,
      typeId: schoolTypeId.value,
      code: 'schoolType',
      name: '学校类型',
      description: '学校类型描述',
      dataType: 'enum',
      isRequired: true,
      defaultValue: 'primary',
      options: JSON.stringify([
        { label: '小学', value: 'primary' },
        { label: '中学', value: 'middle' },
        { label: '高中', value: 'high' },
        { label: '大学', value: 'university' }
      ]),
      status: 'active'
    },
    {
      id: 2,
      typeId: schoolTypeId.value,
      code: 'studentCount',
      name: '学生数量',
      description: '学校学生总数',
      dataType: 'integer',
      isRequired: false,
      defaultValue: '0',
      options: null,
      status: 'active'
    },
    {
      id: 3,
      typeId: schoolTypeId.value,
      code: 'foundingYear',
      name: '建校年份',
      description: '学校成立年份',
      dataType: 'integer',
      isRequired: false,
      defaultValue: null,
      options: null,
      status: 'active'
    }
  ]
}

// 解析选项字符串为对象数组
const parseOptions = (optionsStr) => {
  if (!optionsStr) return []
  try {
    return JSON.parse(optionsStr)
  } catch (err) {
    console.error('解析选项错误:', err)
    return []
  }
}

// 获取属性值
const getAttributeValue = (row, attr) => {
  if (!row.attributes || !row.attributes[attr.code]) return '-'
  
  const value = row.attributes[attr.code]
  
  // 根据属性类型格式化显示
  if (attr.dataType === 'enum') {
    const options = parseOptions(attr.options)
    const option = options.find(opt => opt.value === value)
    return option ? option.label : value
  } else if (attr.dataType === 'boolean') {
    return value ? '是' : '否'
  }
  
  return value
}

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
          schoolList.value = list
          total.value = res.data.total || 0
          loading.value = false
        })
        .catch(err => {
          console.error('获取租户属性值失败:', err)
          schoolList.value = list
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

// 加载租户的属性值
const loadTenantAttributes = async (tenant) => {
  try {
    const res = await getAttributeValuesByTenantId(tenant.id)
    if (res.code === 0 || res.code === 200) {
      const attrValues = res.data || []
      
      // 将属性值转换为对象格式
      const attributes = {}
      attrValues.forEach(attr => {
        // 查找对应的属性定义
        const definition = attributeDefinitions.value.find(def => def.id === attr.attrId)
        if (definition) {
          attributes[definition.code] = attr.value
        }
      })
      
      tenant.attributes = attributes
    }
  } catch (err) {
    console.error(`获取租户(${tenant.id})属性值失败:`, err)
    // 使用模拟属性值
    tenant.attributes = generateMockAttributes(tenant.id)
  }
}

// 生成模拟属性值
const generateMockAttributes = (tenantId) => {
  const attributes = {}
  
  attributeDefinitions.value.forEach(attr => {
    if (attr.dataType === 'string') {
      attributes[attr.code] = `测试${attr.name}${tenantId}`
    } else if (attr.dataType === 'integer') {
      attributes[attr.code] = Math.floor(Math.random() * 1000)
    } else if (attr.dataType === 'decimal') {
      attributes[attr.code] = (Math.random() * 100).toFixed(2)
    } else if (attr.dataType === 'boolean') {
      attributes[attr.code] = Math.random() > 0.5
    } else if (attr.dataType === 'enum') {
      const options = parseOptions(attr.options)
      if (options.length > 0) {
        const randomIndex = Math.floor(Math.random() * options.length)
        attributes[attr.code] = options[randomIndex].value
      }
    } else if (attr.dataType === 'date' || attr.dataType === 'datetime') {
      attributes[attr.code] = new Date().toISOString()
    } else if (attr.dataType === 'text') {
      attributes[attr.code] = `这是一段测试${attr.name}的文本内容。`
    }
  })
  
  return attributes
}

// 使用模拟数据
const useMockData = () => {
  // 模拟数据
  const mockData = Array(15).fill(0).map((_, index) => {
    const tenant = {
      id: index + 1,
      typeId: schoolTypeId.value,
      name: `测试${props.tenantTypeName}${index + 1}`,
      address: `测试地址${index + 1}`,
      contactPerson: `联系人${index + 1}`,
      contactPhone: `1389999${String(index + 1).padStart(4, '0')}`,
      status: index % 3 === 0 ? 'inactive' : 'active',
      deviceCount: Math.floor(Math.random() * 100),
      remark: `这是测试${props.tenantTypeName}${index + 1}的备注信息`,
      attributes: generateMockAttributes(index + 1)
    }
    
    return tenant
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
    
    // 获取属性定义
    fetchAttributeDefinitions().then(() => {
      // 获取租户列表
      getSchoolList()
    })
  } else {
    // 未传入租户类型ID，显示空列表
    schoolList.value = []
    total.value = 0
    loading.value = false
    attributeDefinitions.value = []
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
  schoolForm.attributes = {} // 清空属性值
  
  // 设置默认值
  attributeDefinitions.value.forEach(attr => {
    if (attr.defaultValue) {
      schoolForm.attributes[attr.code] = attr.defaultValue
    }
  })
  
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
  
  // 复制属性值
  schoolForm.attributes = { ...row.attributes }
  
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
      
      const apiCall = dialogType.value === 'add' 
        ? addTenant(submitData)
        : updateTenant(submitData.id, submitData)
      
      apiCall.then(res => {
        if (res.code === 0 || res.code === 200) {
          ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
          dialogVisible.value = false
          getSchoolList()
        } else {
          ElMessage.error(res.message || (dialogType.value === 'add' ? '添加失败' : '修改失败'))
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
    // 获取属性定义
    fetchAttributeDefinitions().then(() => {
      // 获取租户列表
      getSchoolList()
    })
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