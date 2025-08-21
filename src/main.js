import { createApp } from 'vue'

// import './style.css'
import './tailwind.css'
// 导入 PrimeIcons CSS
import 'primeicons/primeicons.css'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import StarSky from './views/components/StarSky.vue'
import pinia from './stores'
import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
// 导入所有Element Plus图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const app = createApp(App)
// 全局注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router)
.use(pinia) // 使用Pinia
.use(ElementPlus) // 注册UI库
.component('StarSky', StarSky)

.mount('#app')








