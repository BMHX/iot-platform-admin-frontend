<template>
  <div class="protocol-management">
    <h2>协议管理</h2>
    
    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAddProtocol">添加协议</el-button>
      <el-button type="danger" :disabled="selectedProtocols.length === 0" @click="handleBatchDelete">批量删除</el-button>
    </div>

    <!-- 协议搜索 -->
    <div class="search-container">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索协议名称/类型"
        style="width: 200px; margin-right: 10px"
        clearable
      />
      <el-select
        v-model="protocolType"
        placeholder="协议类型"
        style="width: 150px; margin-right: 10px"
        clearable
      >
        <el-option label="MQTT" value="MQTT" />
        <el-option label="HTTP" value="HTTP" />
        <el-option label="CoAP" value="CoAP" />
        <el-option label="LwM2M" value="LwM2M" />
        <el-option label="自定义" value="CUSTOM" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>
    
    <!-- 协议列表 -->
    <el-table
      :data="protocolList"
      border
      style="width: 100%"
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="协议名称" width="150" />
      <el-table-column prop="type" label="协议类型" width="100">
        <template #default="scope">
          <el-tag :type="getProtocolTagType(scope.row.type)">
            {{ scope.row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="version" label="协议版本" width="100" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
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
            @click="handleConfig(scope.row)"
          >配置</el-button>
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

    <!-- 添加/编辑协议对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加协议' : '编辑协议'"
      width="600px"
    >
      <el-form
        :model="protocolForm"
        label-width="100px"
        :rules="rules"
        ref="protocolFormRef"
      >
        <el-form-item label="协议名称" prop="name">
          <el-input v-model="protocolForm.name" placeholder="请输入协议名称" />
        </el-form-item>
        <el-form-item label="协议类型" prop="type">
          <el-select v-model="protocolForm.type" placeholder="请选择协议类型" style="width: 100%">
            <el-option label="MQTT" value="MQTT" />
            <el-option label="HTTP" value="HTTP" />
            <el-option label="CoAP" value="CoAP" />
            <el-option label="LwM2M" value="LwM2M" />
            <el-option label="自定义" value="CUSTOM" />
          </el-select>
        </el-form-item>
        <el-form-item label="协议版本" prop="version">
          <el-input v-model="protocolForm.version" placeholder="请输入协议版本" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="protocolForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="protocolForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProtocolForm">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 协议配置对话框 -->
    <el-dialog
      v-model="configDialogVisible"
      title="协议配置"
      width="700px"
    >
      <div v-if="currentProtocol">
        <h3>{{ currentProtocol.name }} 
          <el-tag :type="getProtocolTagType(currentProtocol.type)" style="margin-left: 10px">
            {{ currentProtocol.type }}
          </el-tag>
        </h3>

        <el-tabs v-model="configTab">
          <el-tab-pane label="基础配置" name="basic">
            <el-form label-width="120px">
              <el-form-item label="服务器地址">
                <el-input v-model="protocolConfig.server" placeholder="请输入服务器地址" />
              </el-form-item>
              <el-form-item label="端口">
                <el-input-number v-model="protocolConfig.port" :min="1" :max="65535" />
              </el-form-item>
              <el-form-item label="连接超时(秒)">
                <el-input-number v-model="protocolConfig.timeout" :min="1" :max="60" />
              </el-form-item>
              <el-form-item label="保活时间(秒)">
                <el-input-number v-model="protocolConfig.keepAlive" :min="10" :max="300" />
              </el-form-item>
              <el-form-item label="TLS/SSL">
                <el-switch v-model="protocolConfig.useTls" />
              </el-form-item>
              <el-form-item label="证书路径" v-if="protocolConfig.useTls">
                <el-input v-model="protocolConfig.certPath" placeholder="请输入证书路径" />
              </el-form-item>
            </el-form>
          </el-tab-pane>
          
          <el-tab-pane label="高级配置" name="advanced">
            <div v-if="currentProtocol.type === 'MQTT'">
              <el-form label-width="120px">
                <el-form-item label="QoS级别">
                  <el-radio-group v-model="protocolConfig.mqtt.qos">
                    <el-radio :label="0">0 - 最多一次</el-radio>
                    <el-radio :label="1">1 - 至少一次</el-radio>
                    <el-radio :label="2">2 - 恰好一次</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="清除会话">
                  <el-switch v-model="protocolConfig.mqtt.cleanSession" />
                </el-form-item>
                <el-form-item label="遗嘱主题">
                  <el-input v-model="protocolConfig.mqtt.willTopic" placeholder="请输入遗嘱主题" />
                </el-form-item>
                <el-form-item label="遗嘱消息">
                  <el-input v-model="protocolConfig.mqtt.willMessage" type="textarea" :rows="2" />
                </el-form-item>
              </el-form>
            </div>
            <div v-else-if="currentProtocol.type === 'HTTP'">
              <el-form label-width="120px">
                <el-form-item label="请求方法">
                  <el-select v-model="protocolConfig.http.method" style="width: 100%">
                    <el-option label="GET" value="GET" />
                    <el-option label="POST" value="POST" />
                    <el-option label="PUT" value="PUT" />
                    <el-option label="DELETE" value="DELETE" />
                  </el-select>
                </el-form-item>
                <el-form-item label="内容类型">
                  <el-select v-model="protocolConfig.http.contentType" style="width: 100%">
                    <el-option label="application/json" value="application/json" />
                    <el-option label="application/xml" value="application/xml" />
                    <el-option label="text/plain" value="text/plain" />
                  </el-select>
                </el-form-item>
                <el-form-item label="请求头">
                  <el-input v-model="protocolConfig.http.headers" type="textarea" :rows="3" placeholder="请输入请求头，格式为JSON" />
                </el-form-item>
              </el-form>
            </div>
            <div v-else>
              <p class="no-config-tip">当前协议类型暂无高级配置项</p>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="消息格式" name="message">
            <el-form label-width="120px">
              <el-form-item label="数据格式">
                <el-select v-model="protocolConfig.dataFormat" style="width: 100%">
                  <el-option label="JSON" value="JSON" />
                  <el-option label="XML" value="XML" />
                  <el-option label="二进制" value="BINARY" />
                  <el-option label="自定义" value="CUSTOM" />
                </el-select>
              </el-form-item>
              <el-form-item label="数据编码">
                <el-select v-model="protocolConfig.encoding" style="width: 100%">
                  <el-option label="UTF-8" value="UTF-8" />
                  <el-option label="ASCII" value="ASCII" />
                  <el-option label="ISO-8859-1" value="ISO-8859-1" />
                </el-select>
              </el-form-item>
              <el-form-item label="消息模板">
                <el-input v-model="protocolConfig.messageTemplate" type="textarea" :rows="5" placeholder="请输入消息模板" />
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="configDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveProtocolConfig">保存配置</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getProtocolPage, 
  getProtocolById, 
  createProtocol, 
  updateProtocol, 
  deleteProtocol, 
  batchDeleteProtocol,
  updateProtocolStatus,
  saveProtocolConfig as saveProtocolConfigApi
} from '@/api/platform'

// 列表数据
const loading = ref(false)
const protocolList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')
const protocolType = ref('')
const selectedProtocols = ref([])

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add') // add 或 edit
const protocolFormRef = ref(null)
const protocolForm = reactive({
  id: '',
  name: '',
  type: '',
  version: '',
  description: '',
  status: 1  // 1表示启用，0表示禁用
})

// 配置对话框
const configDialogVisible = ref(false)
const configTab = ref('basic')
const currentProtocol = ref(null)
const protocolConfig = reactive({
  server: '',
  port: 1883,
  timeout: 10,
  keepAlive: 60,
  useTls: false,
  certPath: '',
  dataFormat: 'JSON',
  encoding: 'UTF-8',
  messageTemplate: '',
  mqtt: {
    qos: 1,
    cleanSession: true,
    willTopic: '',
    willMessage: ''
  },
  http: {
    method: 'POST',
    contentType: 'application/json',
    headers: '{}'
  }
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入协议名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择协议类型', trigger: 'change' }
  ],
  version: [
    { required: true, message: '请输入协议版本', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 获取协议标签类型
const getProtocolTagType = (type) => {
  const typeMap = {
    'MQTT': 'success',
    'HTTP': 'primary',
    'CoAP': 'warning',
    'LwM2M': 'info',
    'CUSTOM': 'danger'
  }
  return typeMap[type] || 'info'
}

// 获取协议列表
const getProtocolList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      keyword: searchKeyword.value || undefined,
      type: protocolType.value || undefined
    }
    
    const res = await getProtocolPage(params)
    console.log('协议列表响应:', res)
    
    if (res && (res.code === 0 || res.code === 200)) {
      protocolList.value = res.data?.list || []
      total.value = res.data?.total || 0
    } else {
      protocolList.value = []
      total.value = 0
      ElMessage.error(res?.msg || '获取协议列表失败')
    }
  } catch (error) {
    console.error('获取协议列表出错:', error)
    protocolList.value = []
    total.value = 0
    ElMessage.error('获取协议列表失败')
  } finally {
    loading.value = false
  }
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedProtocols.value = selection
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getProtocolList()
}

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = ''
  protocolType.value = ''
  currentPage.value = 1
  getProtocolList()
}

// 分页变化
const handleSizeChange = (val) => {
  pageSize.value = val
  getProtocolList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  getProtocolList()
}

// 添加协议
const handleAddProtocol = () => {
  dialogType.value = 'add'
  resetProtocolForm()
  dialogVisible.value = true
}

// 编辑协议
const handleEdit = (row) => {
  dialogType.value = 'edit'
  // 填充表单
  Object.assign(protocolForm, {
    id: row.id,
    name: row.name,
    type: row.type,
    version: row.version,
    description: row.description,
    status: row.status
  })
  dialogVisible.value = true
}

// 配置协议
const handleConfig = async (row) => {
  try {
    // 获取协议详情
    const res = await getProtocolById(row.id)
    if (res && (res.code === 0 || res.code === 200)) {
      currentProtocol.value = res.data
      configTab.value = 'basic'
      
      // 初始化配置
      if (res.data.config) {
        try {
          const configData = typeof res.data.config === 'string' 
            ? JSON.parse(res.data.config) 
            : res.data.config
          
          Object.assign(protocolConfig, configData)
        } catch (e) {
          console.error('解析协议配置出错:', e)
          // 使用默认配置
          initDefaultConfig(row.type)
        }
      } else {
        // 使用默认配置
        initDefaultConfig(row.type)
      }
      
      configDialogVisible.value = true
    } else {
      ElMessage.error(res?.msg || '获取协议详情失败')
    }
  } catch (error) {
    console.error('获取协议详情出错:', error)
    ElMessage.error('获取协议详情失败')
  }
}

// 初始化默认配置
const initDefaultConfig = (type) => {
  // 基础配置
  Object.assign(protocolConfig, {
    server: '',
    port: 0,
    timeout: 10,
    keepAlive: 60,
    useTls: false,
    certPath: '',
    dataFormat: 'JSON',
    encoding: 'UTF-8',
    messageTemplate: ''
  })
  
  // 根据协议类型设置默认配置
  if (type === 'MQTT') {
    Object.assign(protocolConfig, {
      server: 'broker.example.com',
      port: 1883,
      mqtt: {
        qos: 1,
        cleanSession: true,
        willTopic: 'devices/disconnected',
        willMessage: '{"deviceId":"${deviceId}","status":"offline"}'
      }
    })
  } else if (type === 'HTTP') {
    Object.assign(protocolConfig, {
      server: 'api.example.com',
      port: 443,
      useTls: true,
      http: {
        method: 'POST',
        contentType: 'application/json',
        headers: '{\n  "Authorization": "Bearer ${token}",\n  "User-Agent": "IoT-Device/1.0"\n}'
      }
    })
  }
}

// 删除协议
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确认删除协议 ${row.name}?`,
    '删除确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        const res = await deleteProtocol(row.id)
        if (res && (res.code === 0 || res.code === 200)) {
          ElMessage.success('协议已删除')
          getProtocolList() // 重新加载列表
        } else {
          ElMessage.error(res?.msg || '删除协议失败')
        }
      } catch (error) {
        console.error('删除协议出错:', error)
        ElMessage.error('删除协议失败')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedProtocols.value.length === 0) return
  
  ElMessageBox.confirm(
    `确认删除选中的 ${selectedProtocols.value.length} 个协议?`,
    '批量删除',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        const ids = selectedProtocols.value.map(item => item.id)
        const res = await batchDeleteProtocol(ids)
        if (res && (res.code === 0 || res.code === 200)) {
          ElMessage.success(`已删除 ${ids.length} 个协议`)
          selectedProtocols.value = []
          getProtocolList() // 重新加载列表
        } else {
          ElMessage.error(res?.msg || '批量删除协议失败')
        }
      } catch (error) {
        console.error('批量删除协议出错:', error)
        ElMessage.error('批量删除协议失败')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 修改状态
const handleStatusChange = async (row) => {
  try {
    const res = await updateProtocolStatus(row.id, row.status)
    if (res && (res.code === 0 || res.code === 200)) {
      const statusText = row.status === 1 ? '启用' : '禁用'
      ElMessage.success(`协议 ${row.name} 已${statusText}`)
    } else {
      // 恢复原状态
      row.status = row.status === 1 ? 0 : 1
      ElMessage.error(res?.msg || '更新协议状态失败')
    }
  } catch (error) {
    // 恢复原状态
    row.status = row.status === 1 ? 0 : 1
    console.error('更新协议状态出错:', error)
    ElMessage.error('更新协议状态失败')
  }
}

// 重置表单
const resetProtocolForm = () => {
  if (protocolFormRef.value) {
    protocolFormRef.value.resetFields()
  }
  Object.assign(protocolForm, {
    id: '',
    name: '',
    type: '',
    version: '',
    description: '',
    status: 1  // 默认启用
  })
}

// 提交表单
const submitProtocolForm = () => {
  if (!protocolFormRef.value) return
  
  protocolFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogType.value === 'add') {
          // 添加协议
          const res = await createProtocol(protocolForm)
          if (res && (res.code === 0 || res.code === 200)) {
            ElMessage.success('协议添加成功')
            dialogVisible.value = false
            getProtocolList() // 重新加载列表
          } else {
            ElMessage.error(res?.msg || '添加协议失败')
          }
        } else {
          // 编辑协议
          const res = await updateProtocol(protocolForm.id, protocolForm)
          if (res && (res.code === 0 || res.code === 200)) {
            ElMessage.success('协议更新成功')
            dialogVisible.value = false
            getProtocolList() // 重新加载列表
          } else {
            ElMessage.error(res?.msg || '更新协议失败')
          }
        }
      } catch (error) {
        console.error(dialogType.value === 'add' ? '添加协议出错:' : '更新协议出错:', error)
        ElMessage.error(dialogType.value === 'add' ? '添加协议失败' : '更新协议失败')
      }
    }
  })
}

// 保存协议配置
const saveProtocolConfig = async () => {
  try {
    const configData = JSON.stringify(protocolConfig)
    const res = await saveProtocolConfigApi(currentProtocol.value.id, configData)
    if (res && (res.code === 0 || res.code === 200)) {
      ElMessage.success(`协议 ${currentProtocol.value.name} 配置已保存`)
      configDialogVisible.value = false
    } else {
      ElMessage.error(res?.msg || '保存协议配置失败')
    }
  } catch (error) {
    console.error('保存协议配置出错:', error)
    ElMessage.error('保存协议配置失败')
  }
}

onMounted(() => {
  getProtocolList()
})
</script>

<style scoped>
.protocol-management {
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

.no-config-tip {
  color: #909399;
  font-style: italic;
  text-align: center;
  margin: 20px 0;
}
</style>
