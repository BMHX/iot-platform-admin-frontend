<template>
  <div class="platform-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>平台管理</span>
        </div>
      </template>
      
      <el-tabs type="border-card">
        <!-- 版本管理 -->
        <el-tab-pane>
          <template #label>
            <div class="custom-tabs-label">
              <el-icon><Files /></el-icon>
              <span>版本管理</span>
            </div>
          </template>
          <version-management />
        </el-tab-pane>
        
        <!-- 协议管理 -->
        <el-tab-pane>
          <template #label>
            <div class="custom-tabs-label">
              <el-icon><Connection /></el-icon>
              <span>协议管理</span>
            </div>
          </template>
          <protocol-management />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VersionManagement from '../settings/components/VersionManagement.vue'
import ProtocolManagement from '../settings/components/ProtocolManagement.vue'
</script>

<style scoped>
.platform-container {
  padding: 20px;
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-tabs-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

:deep(.el-tabs__content) {
  padding: 20px;
}
</style> 