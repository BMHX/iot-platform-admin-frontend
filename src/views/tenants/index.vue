<template>
  <div class="tenants-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>租户管理</span>
        </div>
      </template>
      
      <el-tabs type="border-card">
        <!-- 学校管理 -->
        <el-tab-pane>
          <template #label>
            <div class="custom-tabs-label">
              <el-icon><School /></el-icon>
              <span>学校管理</span>
            </div>
          </template>
          <school-management />
        </el-tab-pane>
        
        <!-- 小区管理 -->
        <el-tab-pane>
          <template #label>
            <div class="custom-tabs-label">
              <el-icon><House /></el-icon>
              <span>小区管理</span>
            </div>
          </template>
          <community-management />
        </el-tab-pane>
        
        <!-- 驿站管理 -->
        <el-tab-pane>
          <template #label>
            <div class="custom-tabs-label">
              <el-icon><Location /></el-icon>
              <span>驿站管理</span>
            </div>
          </template>
          <station-management />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SchoolManagement from '../settings/components/SchoolManagement.vue'
import CommunityManagement from '../settings/components/CommunityManagement.vue'
import StationManagement from '../settings/components/StationManagement.vue'
import { School, House, Location } from '@element-plus/icons-vue'
</script>

<style scoped>
.tenants-container {
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