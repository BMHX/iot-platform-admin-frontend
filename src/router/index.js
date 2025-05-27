import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/',
    component: () => import('../layout/MainLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'DataLine' }
      },
      {
        path: 'devices',
        name: 'Devices',
        component: () => import('../views/devices/index.vue'),
        meta: { title: '设备管理', icon: 'Cpu' }
      },
      {
        path: 'data',
        name: 'Data',
        component: () => import('../views/data/index.vue'),
        meta: { title: '数据分析', icon: 'DataAnalysis' }
      },
      {
        path: 'alerts',
        name: 'Alerts',
        component: () => import('../views/alerts/index.vue'),
        meta: { title: '告警管理', icon: 'AlarmClock' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/users/index.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'system',
        name: 'System',
        component: () => import('../views/settings/index.vue'),
        meta: { title: '系统管理', icon: 'Setting' }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue')
  },
  {
    path: '/:catchAll(.*)',
    component: () => import('../views/error/404.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 导航守卫
router.beforeEach((to, from, next) => {
  // 这里可以添加登录验证等逻辑
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router 