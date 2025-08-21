// 1. 导入Vue Router Router 核心函数和路由模式
import { createRouter, createWebHistory } from 'vue-router';

// 2. 导入路由配置
// 静态路由：所有用户都能访问的页面（登录页、404等）
import staticRoutes from './routes/static'; 
// 管理人员路由：需要管理员权限才能访问
import managerRoutes from './routes/manager';
// 动态路由：根据用户权限动态加载的路由
import dynamicRoutes from './routes/dynamic';

// 3. 导入全局路由守卫（权限控制的核心）
import { 
  globalBeforeEach,   // 全局前置守卫（权限校验、登录拦截）
  globalAfterEach     // 全局后置置守卫（页面标题设置等）
} from './guard';

// 4. 创建路由实例（整个应用的路由核心对象）
const router = createRouter({
  // 路由模式：
  // - createWebHistory：使用 HTML5 History 模式（URL 无 #）
  // - createWebHashHistory：使用哈希模式（URL 带 #）
  history: createWebHistory(import.meta.env.BASE_URL),
  
  // 初始路由配置：包含静态路由和管理人员路由
  routes: [...staticRoutes, ...managerRoutes,...dynamicRoutes],

  
  // 可选：配置路由跳转时的滚动行为（进入新页面自动回到顶部）
  scrollBehavior() {
    return { top: 0 };
  }
});

// 5. 注册全局局守卫守卫（守卫会对所有路由生效）
// 全局前置守卫：路由跳转前触发行（权限校验在这里做）
router.beforeEach(globalBeforeEach);
// 全局后置守卫：路由跳转后执行（设置页面标题等）
router.afterEach(globalAfterEach);

// 6. 导出路由实例，供 main.js 导入使用
export default router;
