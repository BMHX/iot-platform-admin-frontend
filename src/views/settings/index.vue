<template>
  <div class="settings-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>
      
      <el-tabs type="border-card">
        <!-- 管理员管理 -->
        <el-tab-pane>
          <template #label>
            <div class="custom-tabs-label">
              <el-icon><User /></el-icon>
              <span>管理员管理</span>
            </div>
          </template>
          <admin-management />
        </el-tab-pane>
        
        <!-- 权限管理 -->
        <el-tab-pane>
          <template #label>
            <div class="custom-tabs-label">
              <el-icon><Lock /></el-icon>
              <span>权限管理</span>
            </div>
          </template>
          <permission-management />
        </el-tab-pane>
        
        <!-- 菜单管理 -->
        <el-tab-pane>
          <template #label>
            <div class="custom-tabs-label">
              <el-icon><Menu /></el-icon>
              <span>菜单管理</span>
            </div>
          </template>
          <menu-management />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AdminManagement from './components/AdminManagement.vue'
import PermissionManagement from './components/PermissionManagement.vue'
import MenuManagement from './components/MenuManagement.vue'
</script>

<style scoped>
.settings-container {
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