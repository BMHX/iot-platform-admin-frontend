<template>
  <div class="platform-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>平台管理</span>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="协议管理" name="protocol">
          <ProtocolManagement v-if="activeTab === 'protocol'" />
        </el-tab-pane>
        <el-tab-pane label="版本管理" name="version">
          <VersionManagement v-if="activeTab === 'version'" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProtocolManagement from './components/ProtocolManagement.vue'
import VersionManagement from './components/VersionManagement.vue'

const activeTab = ref('protocol')
</script>

<style scoped>
.platform-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 