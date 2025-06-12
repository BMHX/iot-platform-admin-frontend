<template>
  <div class="app-version-management">
    <!-- 顶部按钮 -->
    <div class="action-container">
      <el-button type="primary" @click="showAddVersionDialog('android')">发布Android版本</el-button>
    </div>

    <!-- 平台内容 -->
    <div class="platform-content">
      <!-- Android版本列表 -->
      <el-table :data="androidVersions" border style="width: 100%" v-loading="loading.android">
        <el-table-column prop="versionCode" label="版本号" width="100" />
        <el-table-column prop="versionName" label="版本名称" width="120" />
        <el-table-column prop="releaseTime" label="发布时间" width="180" />
        <el-table-column label="强制更新" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.forceUpdate ? 'danger' : 'info'">
              {{ scope.row.forceUpdate ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="downloadUrl" label="下载链接" width="250" show-overflow-tooltip />
        <el-table-column prop="description" label="更新说明" show-overflow-tooltip />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="handleEdit(scope.row, 'android')"
            >编辑</el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row, 'android')"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑版本对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? `发布Android版本` : `编辑Android版本`"
      width="600px"
    >
      <el-form
        :model="versionForm"
        label-width="120px"
        :rules="rules"
        ref="versionFormRef"
      >
        <el-form-item label="版本号" prop="versionCode">
          <el-input v-model="versionForm.versionCode" placeholder="如：1.0.0" />
        </el-form-item>
        <el-form-item label="版本名称" prop="versionName">
          <el-input v-model="versionForm.versionName" placeholder="如：正式版V1" />
        </el-form-item>
        <el-form-item label="下载链接" prop="downloadUrl">
          <el-input v-model="versionForm.downloadUrl" placeholder="APK下载链接" />
        </el-form-item>
        <el-form-item label="更新策略" prop="forceUpdate">
          <el-radio-group v-model="versionForm.forceUpdate">
            <el-radio :label="true">强制更新</el-radio>
            <el-radio :label="false">建议更新</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="灰度发布比例" prop="grayReleaseRatio" v-if="!versionForm.forceUpdate">
          <el-slider v-model="versionForm.grayReleaseRatio" :step="10" show-stops :marks="grayscaleMarks" />
        </el-form-item>
        <el-form-item label="最低兼容版本" prop="minSupportVersion">
          <el-input v-model="versionForm.minSupportVersion" placeholder="如：0.9.0" />
        </el-form-item>
        <el-form-item label="更新说明" prop="description">
          <el-input
            v-model="versionForm.description"
            type="textarea"
            :rows="5"
            placeholder="请输入版本更新说明"
          />
        </el-form-item>
        <el-form-item label="APK文件" prop="apkFile" v-if="dialogType === 'add'">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
          >
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                请上传APK文件，大小不超过100MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitVersionForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 版本列表
const androidVersions = ref([])

// 加载状态
const loading = reactive({
  android: false
})

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add') // add 或 edit
const currentPlatform = ref('android')
const versionFormRef = ref(null)

// 灰度发布标记
const grayscaleMarks = {
  0: '0%',
  20: '20%',
  40: '40%',
  60: '60%',
  80: '80%',
  100: '100%'
}

// 表单
const versionForm = ref({
  versionCode: '',
  versionName: '',
  downloadUrl: '',
  forceUpdate: false,
  grayReleaseRatio: 100,
  minSupportVersion: '',
  description: '',
  apkFile: null
})

// 表单验证规则
const rules = {
  versionCode: [
    { required: true, message: '请输入版本号', trigger: 'blur' },
    { pattern: /^\d+(\.\d+){0,2}$/, message: '版本号格式不正确', trigger: 'blur' }
  ],
  versionName: [
    { required: true, message: '请输入版本名称', trigger: 'blur' }
  ],
  downloadUrl: [
    { required: true, message: '请输入下载链接', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
  ],
  minSupportVersion: [
    { pattern: /^\d+(\.\d+){0,2}$/, message: '版本号格式不正确', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入更新说明', trigger: 'blur' }
  ]
}

// 显示添加版本对话框
const showAddVersionDialog = (platform) => {
  dialogType.value = 'add'
  currentPlatform.value = platform
  versionForm.value = {
    versionCode: '',
    versionName: '',
    downloadUrl: '',
    forceUpdate: false,
    grayReleaseRatio: 100,
    minSupportVersion: '',
    description: '',
    apkFile: null
  }
  dialogVisible.value = true
}

// 编辑版本
const handleEdit = (row) => {
  dialogType.value = 'edit'
  versionForm.value = {
    ...row,
    id: row.id // 保留ID用于更新
  }
  dialogVisible.value = true
}

// 删除版本
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除Android版本 ${row.versionName} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 这里应该调用API删除数据
    androidVersions.value = androidVersions.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 文件上传
const handleFileChange = (file) => {
  versionForm.value.apkFile = file.raw
}

// 提交表单
const submitVersionForm = () => {
  versionFormRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 添加版本
        const newVersion = {
          id: Date.now(), // 模拟ID
          ...versionForm.value,
          releaseTime: new Date().toLocaleString(),
          // 省略实际文件上传处理
        }
        
        androidVersions.value.unshift(newVersion)
        ElMessage.success('版本发布成功')
      } else {
        // 编辑版本
        const updateVersion = {
          ...versionForm.value,
          // 可能需要更新其他字段
        }
        
        const index = androidVersions.value.findIndex(item => item.id === updateVersion.id)
        if (index !== -1) {
          androidVersions.value[index] = updateVersion
        }
        
        ElMessage.success('版本更新成功')
      }
      
      dialogVisible.value = false
    } else {
      return false
    }
  })
}

// 获取版本列表
const fetchVersions = () => {
  // 获取Android版本
  loading.android = true
  // 这里应该调用API获取数据
  // 模拟数据
  setTimeout(() => {
    androidVersions.value = [
      {
        id: 1,
        versionCode: '1.2.0',
        versionName: '正式版V1.2',
        releaseTime: '2023-05-20 10:00:00',
        forceUpdate: true,
        downloadUrl: 'https://example.com/download/app-v1.2.0.apk',
        minSupportVersion: '1.0.0',
        description: '1. 修复了已知问题\n2. 优化了用户界面\n3. 提升了性能'
      },
      {
        id: 2,
        versionCode: '1.1.0',
        versionName: '正式版V1.1',
        releaseTime: '2023-04-15 14:20:00',
        forceUpdate: false,
        grayReleaseRatio: 80,
        downloadUrl: 'https://example.com/download/app-v1.1.0.apk',
        minSupportVersion: '1.0.0',
        description: '1. 修复了闪退问题\n2. 新增了消息推送功能'
      }
    ]
    loading.android = false
  }, 500)
}

onMounted(() => {
  fetchVersions()
})
</script>

<style scoped>
.app-version-management {
  width: 100%;
}

.action-container {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.platform-content {
  margin-top: 20px;
}

:deep(.el-upload__tip) {
  line-height: 1.2;
  color: #909399;
  font-size: 12px;
}
</style> 