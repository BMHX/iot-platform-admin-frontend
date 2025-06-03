<template>
  <div class="layout">
    <el-container class="container">
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '220px'" class="aside">
        <div class="logo">
          <h2 v-if="!isCollapse">物联网运营平台</h2>
          <h2 v-else>IoT</h2>
        </div>
        <el-menu
          router
          :default-active="activeMenu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          :collapse="isCollapse"
          :collapse-transition="false"
        >
          <el-menu-item
            v-for="route in routes"
            :key="route.path"
            :index="'/' + route.path"
          >
            <el-icon><component :is="route.meta.icon" /></el-icon>
            <template #title>{{ route.meta.title }}</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <!-- 顶部导航 -->
        <el-header class="header">
          <div class="header-left">
            <el-icon :size="20" @click="toggleSidebar">
              <component :is="isCollapse ? 'Expand' : 'Fold'" />
            </el-icon>
          </div>
          <div class="header-right">
            <el-button 
              v-if="isDataScreen" 
              type="primary" 
              @click="toggleFullScreen" 
              class="fullscreen-button"
            >
              <el-icon>
                <component :is="isFullScreen ? 'Close' : 'FullScreen'" />
              </el-icon>
              <span>{{ isFullScreen ? '退出全屏' : '全屏展示' }}</span>
            </el-button>
            <el-dropdown>
              <span class="user-info">
                管理员 <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>个人信息</el-dropdown-item>
                  <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 主内容区 -->
        <el-main :class="['main-content', { 'is-full-screen': isFullScreen }]">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 获取路由信息
const routes = computed(() => {
  return router.options.routes
    .find(r => r.path === '/' && r.children)
    ?.children.filter(item => item.meta && item.meta.title) || []
})

// 当前激活的菜单
const activeMenu = computed(() => {
  return '/' + route.path
})

// 判断是否为数据大屏页面
const isDataScreen = computed(() => {
  return route.path === '/data-screen'
})

// 侧边栏切换
const isCollapse = ref(false)
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
  localStorage.setItem('sidebarStatus', isCollapse.value ? '1' : '0')
}

// 全屏模式
const isFullScreen = ref(false)
const toggleFullScreen = () => {
  isFullScreen.value = !isFullScreen.value
  
  // 获取数据大屏内容区域
  const dataScreenEl = document.querySelector('.data-screen')
  
  if (isFullScreen.value && dataScreenEl) {
    // 进入全屏模式
    if (dataScreenEl.requestFullscreen) {
      dataScreenEl.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else if (dataScreenEl.webkitRequestFullscreen) { /* Safari */
      dataScreenEl.webkitRequestFullscreen();
    } else if (dataScreenEl.msRequestFullscreen) { /* IE11 */
      dataScreenEl.msRequestFullscreen();
    }
  } else {
    // 退出全屏模式
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(err => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
      document.msExitFullscreen();
    }
  }
}

// 监听浏览器全屏状态变化
const handleFullscreenChange = () => {
  isFullScreen.value = !!document.fullscreenElement || 
                      !!document.webkitFullscreenElement || 
                      !!document.msFullscreenElement
}

// 从本地存储中恢复侧边栏状态
const initSidebarStatus = () => {
  const sidebarStatus = localStorage.getItem('sidebarStatus')
  if (sidebarStatus) {
    isCollapse.value = sidebarStatus === '1'
  }
  
  // 添加全屏变化事件监听
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('msfullscreenchange', handleFullscreenChange)
}

// 退出登录
const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

// 页面加载时初始化侧边栏状态
initSidebarStatus()

// 页面卸载时移除事件监听器
onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('msfullscreenchange', handleFullscreenChange)
})

// 当进入数据大屏页面时，自动折叠侧边栏
watch(() => route.path, (newPath) => {
  if (newPath === '/data-screen' && isFullScreen.value) {
    isCollapse.value = true
  }
})
</script>

<style scoped>
.layout {
  height: 100vh;
}

.container {
  height: 100%;
}

.aside {
  background-color: #304156;
  color: #fff;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  overflow: hidden;
}

.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
}

.header-left {
  cursor: pointer;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  width: 100%;
  overflow-x: auto;
  transition: all 0.3s;
}

.is-full-screen {
  padding: 0;
  overflow: hidden;
}

/* 折叠菜单样式优化 */
:deep(.el-menu--collapse) {
  width: 64px;
}

:deep(.el-menu--collapse .el-menu-item) {
  text-align: center;
}

.fullscreen-button {
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #409EFF;
  border-color: #409EFF;
  padding: 8px 15px;
}

.fullscreen-button:hover {
  transform: scale(1.05);
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.fullscreen-button i {
  font-size: 16px;
}
</style> 