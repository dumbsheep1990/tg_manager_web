import './style/element_visiable.scss'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'

import 'element-plus/dist/index.css'
// 引入gin-vue-admin前端初始化相关内容
import './core/gin-vue-admin'
// 引入封装的router
import router from '@/router/index'
import '@/permission'
import run from '@/core/gin-vue-admin.js'
import auth from '@/directive/auth'
import { store } from '@/pinia'

// 引入模拟数据服务 (开发环境使用)
if (import.meta.env.DEV) {
  import('./mock')
  console.log('Mock数据服务已启动')
}
// 引入系统初始化工具
import { autoInit } from '@/utils/init'
import App from './App.vue'

// 开发环境自动初始化系统
autoInit()

const app = createApp(App)
app.config.productionTip = false

app.use(run).use(ElementPlus).use(store).use(auth).use(router).mount('#app')
export default app
