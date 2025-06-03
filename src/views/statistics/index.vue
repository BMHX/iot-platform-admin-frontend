<template>
  <div class="statistics-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>统计管理</span>
        </div>
      </template>
      
      <el-tabs type="border-card">
        <!-- 租户统计 -->
        <el-tab-pane>
          <template #label>
            <div class="custom-tabs-label">
              <el-icon><Histogram /></el-icon>
              <span>租户统计</span>
            </div>
          </template>
          <el-tabs type="card">
            <el-tab-pane label="学校统计">
              <school-statistics />
            </el-tab-pane>
            <el-tab-pane label="小区统计">
              <community-statistics />
            </el-tab-pane>
            <el-tab-pane label="驿站统计">
              <station-statistics />
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
        
        <!-- 设备统计 -->
        <el-tab-pane>
          <template #label>
            <div class="custom-tabs-label">
              <el-icon><Cpu /></el-icon>
              <span>设备统计</span>
            </div>
          </template>
          <device-statistics />
        </el-tab-pane>
        
        <!-- 用户统计 -->
        <el-tab-pane>
          <template #label>
            <div class="custom-tabs-label">
              <el-icon><User /></el-icon>
              <span>用户统计</span>
            </div>
          </template>
          <user-statistics />
        </el-tab-pane>
        
        <!-- 告警统计 -->
        <el-tab-pane>
          <template #label>
            <div class="custom-tabs-label">
              <el-icon><Bell /></el-icon>
              <span>告警统计</span>
            </div>
          </template>
          <alert-statistics />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SchoolStatistics from './components/SchoolStatistics.vue'
import CommunityStatistics from './components/CommunityStatistics.vue'
import StationStatistics from './components/StationStatistics.vue'
import DeviceStatistics from './components/DeviceStatistics.vue'
import UserStatistics from './components/UserStatistics.vue'
import AlertStatistics from './components/AlertStatistics.vue'
import { Histogram, Cpu, User, Bell } from '@element-plus/icons-vue'

onMounted(() => {
  console.log('统计管理页面加载完成')
})
</script>

<style scoped>
.statistics-container {
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

.custom-tabs-label .el-icon {
  margin-right: 4px;
}

:deep(.el-tabs__content) {
  padding: 20px;
}
</style> 