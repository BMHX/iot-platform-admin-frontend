import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 是否为开发环境
const isDevelopment = import.meta.env.MODE === 'development'

// 打印环境信息
console.log('当前环境:', import.meta.env.MODE)
console.log('API基础路径:', import.meta.env.BASE_URL)

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 全局属性
app.config.globalProperties.$isDev = isDevelopment

app.use(ElementPlus)
app.use(createPinia())
app.use(router)
app.mount('#app')
