<template>
  <div class="community-management">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAddCommunity">添加小区</el-button>
      <el-button type="danger" :disabled="selectedCommunities.length === 0" @click="handleBatchDelete">批量删除</el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-container">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索小区名称"
        style="width: 200px; margin-right: 10px"
        clearable
      />
      <el-select
        v-model="communityType"
        placeholder="小区类型"
        style="width: 150px; margin-right: 10px"
        clearable
      >
        <el-option label="住宅小区" value="residential" />
        <el-option label="商业小区" value="commercial" />
        <el-option label="综合小区" value="mixed" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <!-- 小区列表 -->
    <el-table
      :data="communityList"
      border
      style="width: 100%"
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="小区名称" width="180" />
      <el-table-column prop="type" label="小区类型" width="100">
        <template #default="scope">
          <el-tag :type="getCommunityTypeTag(scope.row.type)">
            {{ getCommunityTypeText(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="address" label="地址" />
      <el-table-column prop="buildingCount" label="楼栋数" width="80" />
      <el-table-column prop="contactPerson" label="联系人" width="120" />
      <el-table-column prop="contactPhone" label="联系电话" width="140" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="'active'"
            :inactive-value="'inactive'"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click="handleEdit(scope.row)"
          >编辑</el-button>
          <el-button
            size="small"
            type="success"
            @click="handleViewDetails(scope.row)"
          >详情</el-button>
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
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加/编辑小区对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加小区' : '编辑小区'"
      width="600px"
    >
      <el-form
        :model="communityForm"
        label-width="100px"
        :rules="rules"
        ref="communityFormRef"
      >
        <el-form-item label="小区名称" prop="name">
          <el-input v-model="communityForm.name" placeholder="请输入小区名称" />
        </el-form-item>
        <el-form-item label="小区类型" prop="type">
          <el-select v-model="communityForm.type" placeholder="请选择小区类型" style="width: 100%">
            <el-option label="住宅小区" value="residential" />
            <el-option label="商业小区" value="commercial" />
            <el-option label="综合小区" value="mixed" />
          </el-select>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="communityForm.address" placeholder="请输入小区地址" />
        </el-form-item>
        <el-form-item label="楼栋数" prop="buildingCount">
          <el-input-number v-model="communityForm.buildingCount" :min="1" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="communityForm.contactPerson" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="communityForm.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="communityForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="communityForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCommunityForm">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 小区详情对话框 -->
    <el-dialog
      v-model="detailsDialogVisible"
      title="小区详情"
      width="700px"
    >
      <div v-if="currentCommunity">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="小区名称">{{ currentCommunity.name }}</el-descriptions-item>
          <el-descriptions-item label="小区类型">
            <el-tag :type="getCommunityTypeTag(currentCommunity.type)">
              {{ getCommunityTypeText(currentCommunity.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="地址" :span="2">{{ currentCommunity.address }}</el-descriptions-item>
          <el-descriptions-item label="楼栋数">{{ currentCommunity.buildingCount }}</el-descriptions-item>
          <el-descriptions-item label="单元数">{{ currentCommunity.unitCount }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ currentCommunity.contactPerson }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentCommunity.contactPhone }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentCommunity.createTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentCommunity.status === 'active' ? 'success' : 'info'">
              {{ currentCommunity.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentCommunity.remark || '无' }}</el-descriptions-item>
        </el-descriptions>

        <div class="community-stats" style="margin-top: 20px;">
          <h4>小区统计信息</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card shadow="hover">
                <template #header>
                  <div class="stat-header">
                    <span>设备总数</span>
                  </div>
                </template>
                <div class="stat-value">{{ currentCommunity.deviceCount || 0 }}</div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover">
                <template #header>
                  <div class="stat-header">
                    <span>居民数量</span>
                  </div>
                </template>
                <div class="stat-value">{{ currentCommunity.residentCount || 0 }}</div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover">
                <template #header>
                  <div class="stat-header">
                    <span>户数</span>
                  </div>
                </template>
                <div class="stat-value">{{ currentCommunity.householdCount || 0 }}</div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailsDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleEdit(currentCommunity)">编辑</el-button>
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
const communityList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')
const communityType = ref('')
const selectedCommunities = ref([])

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add') // add 或 edit
const communityFormRef = ref(null)
const communityForm = reactive({
  id: '',
  name: '',
  type: 'residential',
  address: '',
  buildingCount: 1,
  contactPerson: '',
  contactPhone: '',
  status: 'active',
  remark: ''
})

// 详情对话框
const detailsDialogVisible = ref(false)
const currentCommunity = ref(null)

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入小区名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择小区类型', trigger: 'change' }
  ],
  address: [
    { required: true, message: '请输入小区地址', trigger: 'blur' }
  ],
  buildingCount: [
    { required: true, message: '请输入楼栋数', trigger: 'blur' }
  ],
  contactPerson: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 获取小区类型标签类型
const getCommunityTypeTag = (type) => {
  const typeMap = {
    'residential': 'success',
    'commercial': 'primary',
    'mixed': 'warning'
  }
  return typeMap[type] || 'info'
}

// 获取小区类型文本
const getCommunityTypeText = (type) => {
  const typeMap = {
    'residential': '住宅小区',
    'commercial': '商业小区',
    'mixed': '综合小区'
  }
  return typeMap[type] || '未知'
}

// 获取小区列表
const getCommunityList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    // 模拟数据
    const mockCommunities = [
      {
        id: 1,
        name: '阳光花园',
        type: 'residential',
        address: '北京市海淀区西二旗大街58号',
        buildingCount: 15,
        unitCount: 60,
        contactPerson: '张经理',
        contactPhone: '13800138001',
        createTime: '2023-03-10 10:30:00',
        status: 'active',
        remark: '高档住宅小区',
        deviceCount: 230,
        residentCount: 3500,
        householdCount: 1200
      },
      {
        id: 2,
        name: '中关村科技园',
        type: 'commercial',
        address: '北京市海淀区中关村大街18号',
        buildingCount: 8,
        unitCount: 32,
        contactPerson: '李经理',
        contactPhone: '13900139002',
        createTime: '2023-03-15 14:20:00',
        status: 'active',
        remark: '高新技术企业园区',
        deviceCount: 320,
        residentCount: 0,
        householdCount: 150
      },
      {
        id: 3,
        name: '金融街社区',
        type: 'mixed',
        address: '北京市西城区金融街7号',
        buildingCount: 12,
        unitCount: 48,
        contactPerson: '王经理',
        contactPhone: '13700137003',
        createTime: '2023-04-01 09:15:00',
        status: 'active',
        remark: '金融商务区',
        deviceCount: 450,
        residentCount: 2800,
        householdCount: 980
      },
      {
        id: 4,
        name: '星光家园',
        type: 'residential',
        address: '北京市朝阳区建国路128号',
        buildingCount: 20,
        unitCount: 80,
        contactPerson: '赵主管',
        contactPhone: '13600136004',
        createTime: '2023-04-10 11:40:00',
        status: 'active',
        remark: '普通住宅区',
        deviceCount: 180,
        residentCount: 5600,
        householdCount: 1800
      },
      {
        id: 5,
        name: '望京SOHO',
        type: 'commercial',
        address: '北京市朝阳区望京街道',
        buildingCount: 3,
        unitCount: 12,
        contactPerson: '钱经理',
        contactPhone: '13500135005',
        createTime: '2023-05-01 16:25:00',
        status: 'inactive',
        remark: '暂停运营',
        deviceCount: 0,
        residentCount: 0,
        householdCount: 0
      }
    ]
    
    // 过滤
    let filteredCommunities = [...mockCommunities]
    if (searchKeyword.value) {
      filteredCommunities = filteredCommunities.filter(c => c.name.includes(searchKeyword.value))
    }
    if (communityType.value) {
      filteredCommunities = filteredCommunities.filter(c => c.type === communityType.value)
    }
    
    // 分页
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    communityList.value = filteredCommunities.slice(start, end)
    total.value = filteredCommunities.length
    
    loading.value = false
  }, 500)
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedCommunities.value = selection
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getCommunityList()
}

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = ''
  communityType.value = ''
  currentPage.value = 1
  getCommunityList()
}

// 分页变化
const handleSizeChange = (val) => {
  pageSize.value = val
  getCommunityList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getCommunityList()
}

// 添加小区
const handleAddCommunity = () => {
  dialogType.value = 'add'
  resetCommunityForm()
  dialogVisible.value = true
}

// 编辑小区
const handleEdit = (row) => {
  dialogType.value = 'edit'
  // 填充表单
  Object.assign(communityForm, {
    id: row.id,
    name: row.name,
    type: row.type,
    address: row.address,
    buildingCount: row.buildingCount,
    contactPerson: row.contactPerson,
    contactPhone: row.contactPhone,
    status: row.status,
    remark: row.remark || ''
  })
  dialogVisible.value = true
  
  // 如果是从详情页打开的编辑，先关闭详情对话框
  if (detailsDialogVisible.value) {
    detailsDialogVisible.value = false
  }
}

// 查看详情
const handleViewDetails = (row) => {
  currentCommunity.value = { ...row }
  detailsDialogVisible.value = true
}

// 删除小区
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确认删除小区 ${row.name}?`,
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
        const index = communityList.value.findIndex(item => item.id === row.id)
        if (index !== -1) {
          communityList.value.splice(index, 1)
          total.value--
        }
        ElMessage.success('小区已删除')
      }, 300)
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedCommunities.value.length === 0) return
  
  ElMessageBox.confirm(
    `确认删除选中的 ${selectedCommunities.value.length} 个小区?`,
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
        const ids = selectedCommunities.value.map(item => item.id)
        communityList.value = communityList.value.filter(item => !ids.includes(item.id))
        total.value -= ids.length
        
        ElMessage.success(`已删除 ${ids.length} 个小区`)
        selectedCommunities.value = []
      }, 300)
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 修改状态
const handleStatusChange = (row) => {
  const statusText = row.status === 'active' ? '启用' : '禁用'
  ElMessage.success(`小区 ${row.name} 已${statusText}`)
}

// 重置表单
const resetCommunityForm = () => {
  if (communityFormRef.value) {
    communityFormRef.value.resetFields()
  }
  Object.assign(communityForm, {
    id: '',
    name: '',
    type: 'residential',
    address: '',
    buildingCount: 1,
    contactPerson: '',
    contactPhone: '',
    status: 'active',
    remark: ''
  })
}

// 提交表单
const submitCommunityForm = () => {
  if (!communityFormRef.value) return
  
  communityFormRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 添加小区
        const newCommunity = {
          id: new Date().getTime(),
          name: communityForm.name,
          type: communityForm.type,
          address: communityForm.address,
          buildingCount: communityForm.buildingCount,
          unitCount: communityForm.buildingCount * 4, // 假设每栋楼有4个单元
          contactPerson: communityForm.contactPerson,
          contactPhone: communityForm.contactPhone,
          createTime: new Date().toLocaleString(),
          status: communityForm.status,
          remark: communityForm.remark,
          deviceCount: 0,
          residentCount: 0,
          householdCount: 0
        }
        communityList.value.unshift(newCommunity)
        total.value++
        ElMessage.success('小区添加成功')
      } else {
        // 编辑小区
        const index = communityList.value.findIndex(item => item.id === communityForm.id)
        if (index !== -1) {
          // 计算新的单元数
          const unitCount = communityForm.buildingCount * 4 // 假设每栋楼有4个单元
          
          const updatedCommunity = {
            ...communityList.value[index],
            name: communityForm.name,
            type: communityForm.type,
            address: communityForm.address,
            buildingCount: communityForm.buildingCount,
            unitCount: unitCount,
            contactPerson: communityForm.contactPerson,
            contactPhone: communityForm.contactPhone,
            status: communityForm.status,
            remark: communityForm.remark
          }
          communityList.value.splice(index, 1, updatedCommunity)
        }
        ElMessage.success('小区信息更新成功')
      }
      
      dialogVisible.value = false
    }
  })
}

onMounted(() => {
  getCommunityList()
})
</script>

<style scoped>
.community-management {
  width: 100%;
}

.operation-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.search-container {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: #409EFF;
}
</style> 