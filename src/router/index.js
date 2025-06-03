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
        path: 'data-screen',
        name: 'DataScreen',
        component: () => import('../views/data-screen/index.vue'),
        meta: { title: '数据大屏', icon: 'Monitor' }
      },
      {
        path: 'devices',
        name: 'Devices',
        component: () => import('../views/devices/index.vue'),
        meta: { title: '设备管理', icon: 'Cpu' }
      },
      {
        path: 'tenants',
        name: 'Tenants',
        component: () => import('../views/tenants/index.vue'),
        meta: { title: '租户管理', icon: 'UserFilled' }
      },
      {
        path: 'platform',
        name: 'Platform',
        component: () => import('../views/platform/index.vue'),
        meta: { title: '平台管理', icon: 'Platform' }
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('../views/statistics/index.vue'),
        meta: { title: '统计管理', icon: 'PieChart' }
      },
      {
        path: 'system',
        name: 'System',
        component: () => import('../views/settings/index.vue'),
        meta: { title: '系统管理', icon: 'Setting' }
      },
      {
        path: 'app-management',
        name: 'AppManagement',
        component: () => import('../views/app-management/index.vue'),
        meta: { title: 'App管理', icon: 'Cellphone' }
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
  // 如果访问登录页，直接放行
  if (to.path === '/login') {
    next()
    return
  }
  
  // 验证是否登录
  const token = localStorage.getItem('token')
  if (!token) {
    next('/login')
    return
  }
  
  // 获取用户角色
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const role = userInfo.role || ''
  
  // 根据角色设置路由权限
  // 不同角色可访问的路由
  const roleRoutes = {
    admin: ['dashboard', 'data-screen', 'devices', 'tenants', 'platform', 'statistics', 'system', 'app-management'], // 管理员可访问所有
    operator: ['dashboard', 'data-screen', 'devices', 'tenants', 'statistics'], // 运营人员
    tenant: ['dashboard', 'data-screen', 'devices', 'statistics'], // 租户
    user: ['dashboard', 'data-screen', 'devices'] // 普通用户
  }
  
  // 获取当前路由的name（去掉前导'/'）
  const routeName = to.path.split('/')[1]
  
  // 检查用户是否有权限访问当前路由
  if (role && roleRoutes[role] && !roleRoutes[role].includes(routeName) && routeName !== '') {
    // 如果没有权限，重定向到有权限的第一个路由
    next(`/${roleRoutes[role][0] || 'dashboard'}`)
  } else {
    // 有权限，放行
    next()
  }
})

export default router 