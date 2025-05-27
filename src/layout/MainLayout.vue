<template>
  <div class="layout">
    <el-container class="container">
      <!-- 侧边栏 -->
      <el-aside width="220px" class="aside">
        <div class="logo">
          <h2>物联网运营平台</h2>
        </div>
        <el-menu
          router
          :default-active="activeMenu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item
            v-for="route in routes"
            :key="route.path"
            :index="'/' + route.path"
          >
            <el-icon><component :is="route.meta.icon" /></el-icon>
            <span>{{ route.meta.title }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <!-- 顶部导航 -->
        <el-header class="header">
          <div class="header-left">
            <el-icon :size="20" @click="toggleSidebar"><Fold /></el-icon>
          </div>
          <div class="header-right">
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
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
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

// 侧边栏切换
const isCollapse = ref(false)
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 退出登录
const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
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
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
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
}
</style> 