<template>
  <div class="school-management">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAddSchool">添加学校</el-button>
      <el-button type="danger" :disabled="selectedSchools.length === 0" @click="handleBatchDelete">批量删除</el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-container">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索学校名称"
        style="width: 200px; margin-right: 10px"
        clearable
      />
      <el-select
        v-model="schoolLevel"
        placeholder="学校级别"
        style="width: 150px; margin-right: 10px"
        clearable
      >
        <el-option label="小学" value="primary" />
        <el-option label="初中" value="junior" />
        <el-option label="高中" value="high" />
        <el-option label="大学" value="university" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <!-- 学校列表 -->
    <el-table
      :data="schoolList"
      border
      style="width: 100%"
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="学校名称" width="180" />
      <el-table-column prop="level" label="学校级别" width="100">
        <template #default="scope">
          <el-tag :type="getSchoolLevelTag(scope.row.level)">
            {{ getSchoolLevelText(scope.row.level) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="address" label="地址" />
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

    <!-- 添加/编辑学校对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加学校' : '编辑学校'"
      width="600px"
    >
      <el-form
        :model="schoolForm"
        label-width="100px"
        :rules="rules"
        ref="schoolFormRef"
      >
        <el-form-item label="学校名称" prop="name">
          <el-input v-model="schoolForm.name" placeholder="请输入学校名称" />
        </el-form-item>
        <el-form-item label="学校级别" prop="level">
          <el-select v-model="schoolForm.level" placeholder="请选择学校级别" style="width: 100%">
            <el-option label="小学" value="primary" />
            <el-option label="初中" value="junior" />
            <el-option label="高中" value="high" />
            <el-option label="大学" value="university" />
          </el-select>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="schoolForm.address" placeholder="请输入学校地址" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="schoolForm.contactPerson" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="schoolForm.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="schoolForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="schoolForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitSchoolForm">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 学校详情对话框 -->
    <el-dialog
      v-model="detailsDialogVisible"
      title="学校详情"
      width="700px"
    >
      <div v-if="currentSchool">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="学校名称">{{ currentSchool.name }}</el-descriptions-item>
          <el-descriptions-item label="学校级别">
            <el-tag :type="getSchoolLevelTag(currentSchool.level)">
              {{ getSchoolLevelText(currentSchool.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="地址" :span="2">{{ currentSchool.address }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ currentSchool.contactPerson }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentSchool.contactPhone }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentSchool.createTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentSchool.status === 'active' ? 'success' : 'info'">
              {{ currentSchool.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentSchool.remark || '无' }}</el-descriptions-item>
        </el-descriptions>

        <div class="school-stats" style="margin-top: 20px;">
          <h4>学校统计信息</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card shadow="hover">
                <template #header>
                  <div class="stat-header">
                    <span>设备总数</span>
                  </div>
                </template>
                <div class="stat-value">{{ currentSchool.deviceCount || 0 }}</div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover">
                <template #header>
                  <div class="stat-header">
                    <span>教师数量</span>
                  </div>
                </template>
                <div class="stat-value">{{ currentSchool.teacherCount || 0 }}</div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover">
                <template #header>
                  <div class="stat-header">
                    <span>学生数量</span>
                  </div>
                </template>
                <div class="stat-value">{{ currentSchool.studentCount || 0 }}</div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailsDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleEdit(currentSchool)">编辑</el-button>
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
const schoolList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')
const schoolLevel = ref('')
const selectedSchools = ref([])

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add') // add 或 edit
const schoolFormRef = ref(null)
const schoolForm = reactive({
  id: '',
  name: '',
  level: '',
  address: '',
  contactPerson: '',
  contactPhone: '',
  status: 'active',
  remark: ''
})

// 详情对话框
const detailsDialogVisible = ref(false)
const currentSchool = ref(null)

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入学校名称', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请选择学校级别', trigger: 'change' }
  ],
  address: [
    { required: true, message: '请输入学校地址', trigger: 'blur' }
  ],
  contactPerson: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 获取学校级别标签类型
const getSchoolLevelTag = (level) => {
  const levelMap = {
    'primary': 'success',
    'junior': 'warning',
    'high': 'danger',
    'university': 'primary'
  }
  return levelMap[level] || 'info'
}

// 获取学校级别文本
const getSchoolLevelText = (level) => {
  const levelMap = {
    'primary': '小学',
    'junior': '初中',
    'high': '高中',
    'university': '大学'
  }
  return levelMap[level] || '未知'
}

// 获取学校列表
const getSchoolList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    // 模拟数据
    const mockSchools = [
      {
        id: 1,
        name: '第一实验小学',
        level: 'primary',
        address: '北京市海淀区中关村南大街5号',
        contactPerson: '张主任',
        contactPhone: '13800138001',
        createTime: '2023-03-15 10:30:00',
        status: 'active',
        remark: '示范性小学',
        deviceCount: 120,
        teacherCount: 45,
        studentCount: 800
      },
      {
        id: 2,
        name: '第二中学',
        level: 'junior',
        address: '北京市朝阳区建国路88号',
        contactPerson: '李校长',
        contactPhone: '13900139002',
        createTime: '2023-03-20 14:20:00',
        status: 'active',
        remark: '重点中学',
        deviceCount: 180,
        teacherCount: 60,
        studentCount: 1200
      },
      {
        id: 3,
        name: '第三高级中学',
        level: 'high',
        address: '北京市西城区西直门外大街137号',
        contactPerson: '王主任',
        contactPhone: '13700137003',
        createTime: '2023-04-05 09:15:00',
        status: 'active',
        remark: '',
        deviceCount: 210,
        teacherCount: 75,
        studentCount: 1500
      },
      {
        id: 4,
        name: '北京理工大学',
        level: 'university',
        address: '北京市海淀区中关村南大街5号',
        contactPerson: '赵教授',
        contactPhone: '13600136004',
        createTime: '2023-04-15 11:40:00',
        status: 'active',
        remark: '985高校',
        deviceCount: 1500,
        teacherCount: 2000,
        studentCount: 30000
      },
      {
        id: 5,
        name: '实验中学',
        level: 'junior',
        address: '北京市海淀区学院路15号',
        contactPerson: '钱主任',
        contactPhone: '13500135005',
        createTime: '2023-05-10 16:25:00',
        status: 'inactive',
        remark: '暂停合作',
        deviceCount: 0,
        teacherCount: 0,
        studentCount: 0
      }
    ]
    
    // 过滤
    let filteredSchools = [...mockSchools]
    if (searchKeyword.value) {
      filteredSchools = filteredSchools.filter(s => s.name.includes(searchKeyword.value))
    }
    if (schoolLevel.value) {
      filteredSchools = filteredSchools.filter(s => s.level === schoolLevel.value)
    }
    
    // 分页
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    schoolList.value = filteredSchools.slice(start, end)
    total.value = filteredSchools.length
    
    loading.value = false
  }, 500)
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedSchools.value = selection
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getSchoolList()
}

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = ''
  schoolLevel.value = ''
  currentPage.value = 1
  getSchoolList()
}

// 分页变化
const handleSizeChange = (val) => {
  pageSize.value = val
  getSchoolList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getSchoolList()
}

// 添加学校
const handleAddSchool = () => {
  dialogType.value = 'add'
  resetSchoolForm()
  dialogVisible.value = true
}

// 编辑学校
const handleEdit = (row) => {
  dialogType.value = 'edit'
  // 填充表单
  Object.assign(schoolForm, {
    id: row.id,
    name: row.name,
    level: row.level,
    address: row.address,
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
  currentSchool.value = { ...row }
  detailsDialogVisible.value = true
}

// 删除学校
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确认删除学校 ${row.name}?`,
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
        const index = schoolList.value.findIndex(item => item.id === row.id)
        if (index !== -1) {
          schoolList.value.splice(index, 1)
          total.value--
        }
        ElMessage.success('学校已删除')
      }, 300)
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedSchools.value.length === 0) return
  
  ElMessageBox.confirm(
    `确认删除选中的 ${selectedSchools.value.length} 个学校?`,
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
        const ids = selectedSchools.value.map(item => item.id)
        schoolList.value = schoolList.value.filter(item => !ids.includes(item.id))
        total.value -= ids.length
        
        ElMessage.success(`已删除 ${ids.length} 个学校`)
        selectedSchools.value = []
      }, 300)
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 修改状态
const handleStatusChange = (row) => {
  const statusText = row.status === 'active' ? '启用' : '禁用'
  ElMessage.success(`学校 ${row.name} 已${statusText}`)
}

// 重置表单
const resetSchoolForm = () => {
  if (schoolFormRef.value) {
    schoolFormRef.value.resetFields()
  }
  Object.assign(schoolForm, {
    id: '',
    name: '',
    level: '',
    address: '',
    contactPerson: '',
    contactPhone: '',
    status: 'active',
    remark: ''
  })
}

// 提交表单
const submitSchoolForm = () => {
  if (!schoolFormRef.value) return
  
  schoolFormRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 添加学校
        const newSchool = {
          id: new Date().getTime(),
          name: schoolForm.name,
          level: schoolForm.level,
          address: schoolForm.address,
          contactPerson: schoolForm.contactPerson,
          contactPhone: schoolForm.contactPhone,
          createTime: new Date().toLocaleString(),
          status: schoolForm.status,
          remark: schoolForm.remark,
          deviceCount: 0,
          teacherCount: 0,
          studentCount: 0
        }
        schoolList.value.unshift(newSchool)
        total.value++
        ElMessage.success('学校添加成功')
      } else {
        // 编辑学校
        const index = schoolList.value.findIndex(item => item.id === schoolForm.id)
        if (index !== -1) {
          const updatedSchool = {
            ...schoolList.value[index],
            name: schoolForm.name,
            level: schoolForm.level,
            address: schoolForm.address,
            contactPerson: schoolForm.contactPerson,
            contactPhone: schoolForm.contactPhone,
            status: schoolForm.status,
            remark: schoolForm.remark
          }
          schoolList.value.splice(index, 1, updatedSchool)
        }
        ElMessage.success('学校信息更新成功')
      }
      
      dialogVisible.value = false
    }
  })
}

onMounted(() => {
  getSchoolList()
})
</script>

<style scoped>
.school-management {
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