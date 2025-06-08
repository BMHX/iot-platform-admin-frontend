<template>
  <div class="version-management">
    <h2>版本管理</h2>
    
    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAddVersion">添加版本</el-button>
      <el-button type="success" @click="handleExportLog">导出版本日志</el-button>
    </div>

    <!-- 版本搜索 -->
    <div class="search-container">
      <el-input
        v-model="searchVersion"
        placeholder="搜索版本号"
        style="width: 200px; margin-right: 10px"
        clearable
      />
      <el-select
        v-model="versionType"
        placeholder="版本类型"
        style="width: 150px; margin-right: 10px"
        clearable
      >
        <el-option label="正式版" value="stable" />
        <el-option label="测试版" value="beta" />
        <el-option label="内测版" value="alpha" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>
    
    <!-- 版本列表 -->
    <el-table
      :data="versionList"
      border
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="version" label="版本号" width="120" />
      <el-table-column prop="type" label="版本类型" width="100">
        <template #default="scope">
          <el-tag
            :type="getVersionTagType(scope.row.type)"
          >
            {{ getVersionTypeText(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="publishTime" label="发布时间" width="180" />
      <el-table-column prop="publisher" label="发布人" width="120" />
      <el-table-column label="当前版本" width="100">
        <template #default="scope">
          <el-tag type="success" v-if="scope.row.isActive">是</el-tag>
          <el-tag type="info" v-else>否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click="handleEdit(scope.row)"
          >编辑</el-button>
          <el-button
            size="small"
            type="success"
            @click="handleSetActive(scope.row)"
            :disabled="scope.row.isActive"
          >设为当前版本</el-button>
          <el-button
            size="small"
            type="info"
            @click="handlePreview(scope.row)"
          >预览</el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.row)"
            :disabled="scope.row.isActive"
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

    <!-- 添加/编辑版本对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加版本' : '编辑版本'"
      width="700px"
    >
      <el-form
        :model="versionForm"
        label-width="100px"
        :rules="rules"
        ref="versionFormRef"
      >
        <el-form-item label="版本号" prop="version">
          <el-input v-model="versionForm.version" placeholder="请输入版本号，例如：1.0.0" />
        </el-form-item>
        <el-form-item label="版本类型" prop="type">
          <el-radio-group v-model="versionForm.type">
            <el-radio label="stable">正式版</el-radio>
            <el-radio label="beta">测试版</el-radio>
            <el-radio label="alpha">内测版</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="versionForm.description" placeholder="请输入版本描述" />
        </el-form-item>
        <el-form-item label="更新内容" prop="updateContent">
          <el-input
            v-model="versionForm.updateContent"
            type="textarea"
            :rows="10"
            placeholder="请输入版本更新内容，支持Markdown格式"
          />
        </el-form-item>
        <el-form-item label="发布人" prop="publisher">
          <el-input v-model="versionForm.publisher" placeholder="请输入发布人" />
        </el-form-item>
        <el-form-item label="设为当前版本">
          <el-switch v-model="versionForm.isActive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitVersionForm">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 版本预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="版本预览"
      width="700px"
    >
      <div v-if="currentVersion" class="version-preview">
        <h2>{{ currentVersion.version }} 
          <el-tag :type="getVersionTagType(currentVersion.type)" style="margin-left: 10px">
            {{ getVersionTypeText(currentVersion.type) }}
          </el-tag>
        </h2>
        <p class="version-info">
          <span>发布时间: {{ currentVersion.publishTime }}</span>
          <span>发布人: {{ currentVersion.publisher }}</span>
        </p>
        <p class="version-description">{{ currentVersion.description }}</p>
        <div class="version-content" v-html="renderedContent"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getVersionPage, 
  getVersionById, 
  createVersion, 
  updateVersion, 
  deleteVersion, 
  setActiveVersion,
  exportVersionLog
} from '@/api/platform'
import { marked } from 'marked'

// 列表数据
const loading = ref(false)
const versionList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchVersion = ref('')
const versionType = ref('')

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add') // add 或 edit
const versionFormRef = ref(null)
const versionForm = reactive({
  id: '',
  version: '',
  type: 'stable',
  description: '',
  updateContent: '',
  publisher: '',
  isActive: false
})

// 预览对话框
const previewDialogVisible = ref(false)
const currentVersion = ref(null)
const renderedContent = computed(() => {
  if (currentVersion.value && currentVersion.value.updateContent) {
    try {
      return marked(currentVersion.value.updateContent)
    } catch (error) {
      console.error('Markdown渲染错误:', error)
      return currentVersion.value.updateContent
    }
  }
  return ''
})

// 表单验证规则
const rules = {
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' },
    { pattern: /^\d+\.\d+\.\d+$/, message: '版本号格式应为 x.y.z', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择版本类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入版本描述', trigger: 'blur' }
  ],
  updateContent: [
    { required: true, message: '请输入更新内容', trigger: 'blur' }
  ],
  publisher: [
    { required: true, message: '请输入发布人', trigger: 'blur' }
  ]
}

// 获取版本标签类型
const getVersionTagType = (type) => {
  const typeMap = {
    'stable': 'success',
    'beta': 'warning',
    'alpha': 'danger'
  }
  return typeMap[type] || 'info'
}

// 获取版本类型文本
const getVersionTypeText = (type) => {
  const typeMap = {
    'stable': '正式版',
    'beta': '测试版',
    'alpha': '内测版'
  }
  return typeMap[type] || type
}

// 获取版本列表
const getVersionList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      version: searchVersion.value || undefined,
      type: versionType.value || undefined
    }
    
    const res = await getVersionPage(params)
    console.log('版本列表响应:', res)
    
    if (res && (res.code === 0 || res.code === 200)) {
      versionList.value = res.data?.list || []
      total.value = res.data?.total || 0
    } else {
      versionList.value = []
      total.value = 0
      ElMessage.error(res?.msg || '获取版本列表失败')
    }
  } catch (error) {
    console.error('获取版本列表出错:', error)
    versionList.value = []
    total.value = 0
    ElMessage.error('获取版本列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getVersionList()
}

// 重置搜索
const resetSearch = () => {
  searchVersion.value = ''
  versionType.value = ''
  currentPage.value = 1
  getVersionList()
}

// 分页变化
const handleSizeChange = (val) => {
  pageSize.value = val
  getVersionList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getVersionList()
}

// 添加版本
const handleAddVersion = () => {
  dialogType.value = 'add'
  resetVersionForm()
  dialogVisible.value = true
}

// 编辑版本
const handleEdit = async (row) => {
  dialogType.value = 'edit'
  try {
    const res = await getVersionById(row.id)
    if (res && (res.code === 0 || res.code === 200)) {
      Object.assign(versionForm, {
        id: res.data.id,
        version: res.data.version,
        type: res.data.type,
        description: res.data.description,
        updateContent: res.data.updateContent,
        publisher: res.data.publisher,
        isActive: res.data.isActive
      })
      dialogVisible.value = true
    } else {
      ElMessage.error(res?.msg || '获取版本详情失败')
    }
  } catch (error) {
    console.error('获取版本详情出错:', error)
    ElMessage.error('获取版本详情失败')
  }
}

// 预览版本
const handlePreview = async (row) => {
  try {
    const res = await getVersionById(row.id)
    if (res && (res.code === 0 || res.code === 200)) {
      currentVersion.value = res.data
      previewDialogVisible.value = true
    } else {
      ElMessage.error(res?.msg || '获取版本详情失败')
    }
  } catch (error) {
    console.error('获取版本详情出错:', error)
    ElMessage.error('获取版本详情失败')
  }
}

// 设为当前版本
const handleSetActive = (row) => {
  if (row.isActive) return
  
  ElMessageBox.confirm(
    `确认将 ${row.version} 设为当前版本?`,
    '设置当前版本',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        const res = await setActiveVersion(row.id)
        if (res && (res.code === 0 || res.code === 200)) {
          ElMessage.success(`版本 ${row.version} 已设为当前版本`)
          getVersionList() // 重新加载列表
        } else {
          ElMessage.error(res?.msg || '设置当前版本失败')
        }
      } catch (error) {
        console.error('设置当前版本出错:', error)
        ElMessage.error('设置当前版本失败')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 删除版本
const handleDelete = (row) => {
  if (row.isActive) {
    ElMessage.warning('当前激活版本不能删除')
    return
  }
  
  ElMessageBox.confirm(
    `确认删除版本 ${row.version}?`,
    '删除确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        const res = await deleteVersion(row.id)
        if (res && (res.code === 0 || res.code === 200)) {
          ElMessage.success('版本已删除')
          getVersionList() // 重新加载列表
        } else {
          ElMessage.error(res?.msg || '删除版本失败')
        }
      } catch (error) {
        console.error('删除版本出错:', error)
        ElMessage.error('删除版本失败')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 导出版本日志
const handleExportLog = async () => {
  try {
    loading.value = true
    const res = await exportVersionLog()
    
    if (res) {
      // 创建Blob对象
      const blob = new Blob([res], { type: 'text/markdown' })
      
      // 创建下载链接
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'version-changelog.md'
      link.click()
      
      // 释放URL对象
      URL.revokeObjectURL(link.href)
      
      ElMessage.success('版本日志已导出')
    } else {
      ElMessage.error('导出版本日志失败')
    }
  } catch (error) {
    console.error('导出版本日志出错:', error)
    ElMessage.error('导出版本日志失败')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetVersionForm = () => {
  if (versionFormRef.value) {
    versionFormRef.value.resetFields()
  }
  Object.assign(versionForm, {
    id: '',
    version: '',
    type: 'stable',
    description: '',
    updateContent: '',
    publisher: '',
    isActive: false
  })
}

// 提交表单
const submitVersionForm = () => {
  if (!versionFormRef.value) return
  
  versionFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogType.value === 'add') {
          // 添加版本
          const res = await createVersion(versionForm)
          if (res && (res.code === 0 || res.code === 200)) {
            ElMessage.success('版本添加成功')
            dialogVisible.value = false
            getVersionList() // 重新加载列表
          } else {
            ElMessage.error(res?.msg || '添加版本失败')
          }
        } else {
          // 编辑版本
          const res = await updateVersion(versionForm.id, versionForm)
          if (res && (res.code === 0 || res.code === 200)) {
            ElMessage.success('版本更新成功')
            dialogVisible.value = false
            getVersionList() // 重新加载列表
          } else {
            ElMessage.error(res?.msg || '更新版本失败')
          }
        }
      } catch (error) {
        console.error(dialogType.value === 'add' ? '添加版本出错:' : '更新版本出错:', error)
        ElMessage.error(dialogType.value === 'add' ? '添加版本失败' : '更新版本失败')
      }
    }
  })
}

onMounted(() => {
  getVersionList()
})
</script>

<style scoped>
.version-management {
  width: 100%;
  padding: 20px;
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

.version-preview {
  padding: 10px;
}

.version-info {
  display: flex;
  justify-content: space-between;
  color: #666;
  margin: 10px 0;
}

.version-description {
  font-style: italic;
  color: #666;
  margin-bottom: 20px;
}

.version-content {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

:deep(.version-content h2) {
  font-size: 1.5em;
  margin: 1em 0 0.5em;
}

:deep(.version-content h3) {
  font-size: 1.2em;
  margin: 1em 0 0.5em;
}

:deep(.version-content ul) {
  padding-left: 20px;
}

:deep(.version-content li) {
  margin: 5px 0;
}
</style> 