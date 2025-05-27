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
const getVersionList = () => {
  loading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    // 模拟数据
    const mockVersions = [
      {
        id: 1,
        version: '1.0.0',
        type: 'stable',
        description: '首个正式版本',
        updateContent: '## 新特性\n- 基础功能实现\n- 设备管理\n- 数据分析\n- 告警功能',
        publishTime: '2023-04-15 10:00:00',
        publisher: '管理员',
        isActive: true
      },
      {
        id: 2,
        version: '0.9.0',
        type: 'beta',
        description: '公测版本',
        updateContent: '## 新特性\n- 基础功能实现\n- 设备管理\n- 数据分析',
        publishTime: '2023-03-20 14:30:00',
        publisher: '系统管理员',
        isActive: false
      },
      {
        id: 3,
        version: '0.8.5',
        type: 'beta',
        description: '测试版更新',
        updateContent: '## 修复\n- 修复了设备连接问题\n- 优化了数据展示',
        publishTime: '2023-03-10 09:15:00',
        publisher: '系统管理员',
        isActive: false
      },
      {
        id: 4,
        version: '0.8.0',
        type: 'alpha',
        description: '内部测试版',
        updateContent: '## 内测功能\n- 设备管理基础实现\n- 简单数据展示',
        publishTime: '2023-02-25 11:20:00',
        publisher: '系统管理员',
        isActive: false
      },
      {
        id: 5,
        version: '0.7.0',
        type: 'alpha',
        description: '初始开发版本',
        updateContent: '## 初始开发\n- 项目初始化\n- 基础框架搭建',
        publishTime: '2023-02-10 16:45:00',
        publisher: '系统管理员',
        isActive: false
      }
    ]
    
    // 过滤
    let filteredVersions = [...mockVersions]
    if (searchVersion.value) {
      filteredVersions = filteredVersions.filter(v => v.version.includes(searchVersion.value))
    }
    if (releaseType.value) {
      filteredVersions = filteredVersions.filter(v => v.type === releaseType.value)
    }
    
    // 分页
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    versionList.value = filteredVersions.slice(start, end)
    total.value = filteredVersions.length
    
    loading.value = false
  }, 500)
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
  
  versionFormRef.value.validate((valid) => {
    if (valid) {
      // 模拟API请求
      setTimeout(() => {
        // 如果设置为激活，先将其他版本设为非激活
        if (versionForm.isActive) {
          versionList.value.forEach(v => {
            v.isActive = false
          })
        }
        
        // 添加新版本
        const newVersion = {
          id: new Date().getTime(),
          version: versionForm.version,
          type: versionForm.type,
          description: versionForm.description,
          updateContent: versionForm.updateContent,
          publishTime: new Date().toLocaleString(),
          publisher: '当前管理员',
          isActive: versionForm.isActive
        }
        
        versionList.value.unshift(newVersion)
        total.value++
        
        ElMessage.success('版本发布成功')
        publishDialogVisible.value = false
      }, 500)
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
    .then(() => {
      // 模拟API请求
      setTimeout(() => {
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
      }, 300)
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
    .then(() => {
      // 模拟API请求
      setTimeout(() => {
        const index = versionList.value.findIndex(v => v.id === row.id)
        if (index !== -1) {
          versionList.value.splice(index, 1)
          total.value--
        }
        ElMessage.success('版本已删除')
      }, 300)
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 查看详情
const handleViewDetails = (row) => {
  currentVersion.value = { ...row }
  detailsDialogVisible.value = true
}

// 生成版本日志
const handleGenerateLog = () => {
  // 模拟API请求
  setTimeout(() => {
    // 这里模拟生成版本日志文件下载
    ElMessage.success('版本日志已生成，正在下载...')
    
    // 模拟下载操作
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent('版本日志内容...'))
    element.setAttribute('download', 'version-changelog.md')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }, 500)
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