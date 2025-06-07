<template>
  <div class="version-management">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handlePublishVersion">发布新版本</el-button>
      <el-button type="success" @click="handleGenerateLog">生成版本日志</el-button>
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
        v-model="releaseType"
        placeholder="发布类型"
        style="width: 130px; margin-right: 10px"
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
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="version" label="版本号" width="120" />
      <el-table-column prop="type" label="发布类型" width="100">
        <template #default="scope">
          <el-tag
            :type="scope.row.type === 'stable' ? 'success' : scope.row.type === 'beta' ? 'warning' : 'info'"
          >
            {{ scope.row.type === 'stable' ? '正式版' : scope.row.type === 'beta' ? '测试版' : '内测版' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="版本描述" />
      <el-table-column prop="publishTime" label="发布时间" width="180" />
      <el-table-column prop="publisher" label="发布人" width="100" />
      <el-table-column prop="isActive" label="当前激活" width="100">
        <template #default="scope">
          <el-tag type="success" v-if="scope.row.isActive">是</el-tag>
          <el-tag type="info" v-else>否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click="handleViewDetails(scope.row)"
          >查看详情</el-button>
          <el-button
            size="small"
            type="success"
            @click="handleSetActive(scope.row)"
            :disabled="scope.row.isActive"
          >设为当前版本</el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDeleteVersion(scope.row)"
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

    <!-- 版本发布对话框 -->
    <el-dialog
      v-model="publishDialogVisible"
      title="发布新版本"
      width="600px"
    >
      <el-form
        :model="versionForm"
        label-width="100px"
        :rules="rules"
        ref="versionFormRef"
      >
        <el-form-item label="版本号" prop="version">
          <el-input v-model="versionForm.version" placeholder="如：1.0.0" />
        </el-form-item>
        <el-form-item label="发布类型" prop="type">
          <el-radio-group v-model="versionForm.type">
            <el-radio label="stable">正式版</el-radio>
            <el-radio label="beta">测试版</el-radio>
            <el-radio label="alpha">内测版</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="版本描述" prop="description">
          <el-input v-model="versionForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="更新内容" prop="updateContent">
          <el-input v-model="versionForm.updateContent" type="textarea" :rows="5" placeholder="请输入更新内容，支持Markdown格式" />
        </el-form-item>
        <el-form-item label="是否激活">
          <el-switch v-model="versionForm.isActive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="publishDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitVersionForm">确认发布</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 版本详情对话框 -->
    <el-dialog
      v-model="detailsDialogVisible"
      title="版本详情"
      width="600px"
    >
      <div v-if="currentVersion">
        <div class="version-details">
          <h3>{{ currentVersion.version }} 
            <el-tag
              :type="currentVersion.type === 'stable' ? 'success' : currentVersion.type === 'beta' ? 'warning' : 'info'"
              style="margin-left: 10px"
            >
              {{ currentVersion.type === 'stable' ? '正式版' : currentVersion.type === 'beta' ? '测试版' : '内测版' }}
            </el-tag>
            <el-tag type="success" v-if="currentVersion.isActive" style="margin-left: 10px">当前版本</el-tag>
          </h3>
          <p><strong>发布时间：</strong>{{ currentVersion.publishTime }}</p>
          <p><strong>发布人：</strong>{{ currentVersion.publisher }}</p>
          <p><strong>版本描述：</strong>{{ currentVersion.description }}</p>
          <div class="update-content">
            <h4>更新内容：</h4>
            <div v-html="formattedUpdateContent"></div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailsDialogVisible = false">关闭</el-button>
          <el-button 
            type="success" 
            @click="handleSetActive(currentVersion)"
            :disabled="currentVersion && currentVersion.isActive"
          >设为当前版本</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { marked } from 'marked'
import { 
  getVersionPage, 
  getVersionById, 
  createVersion, 
  updateVersion, 
  deleteVersion, 
  setActiveVersion,
  generateVersionLog
} from '@/api/platform'

// 列表数据
const loading = ref(false)
const versionList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchVersion = ref('')
const releaseType = ref('')

// 对话框
const publishDialogVisible = ref(false)
const versionFormRef = ref(null)
const versionForm = reactive({
  version: '',
  type: 'stable',
  description: '',
  updateContent: '',
  isActive: false
})

// 详情对话框
const detailsDialogVisible = ref(false)
const currentVersion = ref(null)
const formattedUpdateContent = computed(() => {
  if (!currentVersion.value || !currentVersion.value.updateContent) return ''
  return marked(currentVersion.value.updateContent)
})

// 表单验证规则
const rules = {
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' },
    { pattern: /^\d+\.\d+\.\d+$/, message: '版本号格式为 x.y.z', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择发布类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入版本描述', trigger: 'blur' }
  ],
  updateContent: [
    { required: true, message: '请输入更新内容', trigger: 'blur' }
  ]
}

// 获取版本列表
const getVersionList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      version: searchVersion.value || undefined,
      type: releaseType.value || undefined
    }
    
    const res = await getVersionPage(params)
    if (res && res.code === 0) {
      versionList.value = res.data.list
      total.value = res.data.total
    } else {
      ElMessage.error(res.msg || '获取版本列表失败')
    }
  } catch (error) {
    console.error('获取版本列表出错:', error)
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
  releaseType.value = ''
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

// 发布新版本
const handlePublishVersion = () => {
  resetVersionForm()
  publishDialogVisible.value = true
}

// 重置表单
const resetVersionForm = () => {
  if (versionFormRef.value) {
    versionFormRef.value.resetFields()
  }
  Object.assign(versionForm, {
    version: '',
    type: 'stable',
    description: '',
    updateContent: '',
    isActive: false
  })
}

// 提交表单
const submitVersionForm = () => {
  if (!versionFormRef.value) return
  
  versionFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 添加新版本
        const res = await createVersion(versionForm)
        if (res && res.code === 0) {
          ElMessage.success('版本发布成功')
          publishDialogVisible.value = false
          getVersionList() // 重新加载列表
        } else {
          ElMessage.error(res.msg || '版本发布失败')
        }
      } catch (error) {
        console.error('版本发布出错:', error)
        ElMessage.error('版本发布失败')
      }
    }
  })
}

// 设置当前版本
const handleSetActive = (row) => {
  if (row.isActive) return
  
  ElMessageBox.confirm(
    `确认将版本 ${row.version} 设置为当前版本?`,
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
        if (res && res.code === 0) {
          // 将所有版本设为非激活
          versionList.value.forEach(v => {
            v.isActive = false
          })
          
          // 设置当前版本为激活
          const index = versionList.value.findIndex(v => v.id === row.id)
          if (index !== -1) {
            versionList.value[index].isActive = true
          }
          
          // 如果是从详情页操作的，更新currentVersion
          if (currentVersion.value && currentVersion.value.id === row.id) {
            currentVersion.value.isActive = true
          }
          
          ElMessage.success(`版本 ${row.version} 已设置为当前版本`)
        } else {
          ElMessage.error(res.msg || '设置当前版本失败')
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
const handleDeleteVersion = (row) => {
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
        if (res && res.code === 0) {
          ElMessage.success('版本已删除')
          getVersionList() // 重新加载列表
        } else {
          ElMessage.error(res.msg || '删除版本失败')
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

// 查看详情
const handleViewDetails = async (row) => {
  try {
    const res = await getVersionById(row.id)
    if (res && res.code === 0) {
      currentVersion.value = res.data
      detailsDialogVisible.value = true
    } else {
      ElMessage.error(res.msg || '获取版本详情失败')
    }
  } catch (error) {
    console.error('获取版本详情出错:', error)
    ElMessage.error('获取版本详情失败')
  }
}

// 生成版本日志
const handleGenerateLog = async () => {
  try {
    await generateVersionLog()
    ElMessage.success('版本日志已生成，正在下载...')
  } catch (error) {
    console.error('生成版本日志出错:', error)
    ElMessage.error('生成版本日志失败')
  }
}

onMounted(() => {
  getVersionList()
})
</script>

<style scoped>
.version-management {
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

.version-details {
  padding: 10px;
}

.update-content {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.update-content h4 {
  margin-bottom: 10px;
}
</style> 