<template>
  <div class="app-management">
    <el-tabs type="border-card">
      <!-- App用户管理 -->
      <el-tab-pane>
        <template #label>
          <div class="custom-tabs-label">
            <el-icon><User /></el-icon>
            <span>App用户管理</span>
          </div>
        </template>
        <app-user-management />
      </el-tab-pane>
      
      <!-- App版本管理 -->
      <el-tab-pane>
        <template #label>
          <div class="custom-tabs-label">
            <el-icon><Files /></el-icon>
            <span>App版本管理</span>
          </div>
        </template>
        <app-version-management />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppUserManagement from './AppUserManagement.vue'
import AppVersionManagement from './AppVersionManagement.vue'
import { User, Files } from '@element-plus/icons-vue'
</script>

<style scoped>
.app-management {
  width: 100%;
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