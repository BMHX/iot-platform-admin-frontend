<template>
  <div class="app-management-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>App管理</span>
        </div>
      </template>
      
      <el-tabs type="border-card">
        <!-- App用户管理 -->
        <el-tab-pane>
          <template #label>
            <div class="custom-tabs-label">
              <el-icon><UserFilled /></el-icon>
              <span>用户管理</span>
            </div>
          </template>
          <app-user-management />
        </el-tab-pane>
        
        <!-- App版本管理 -->
        <el-tab-pane>
          <template #label>
            <div class="custom-tabs-label">
              <el-icon><Promotion /></el-icon>
              <span>版本管理</span>
            </div>
          </template>
          <app-version-management />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppUserManagement from './components/AppUserManagement.vue'
import AppVersionManagement from './components/AppVersionManagement.vue'
import { UserFilled, Promotion } from '@element-plus/icons-vue'
</script>

<style scoped>
.app-management-container {
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