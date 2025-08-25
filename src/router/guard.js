// 路由守卫配置文件
// 负责处理路由跳转的权限控制、登录拦截和动态路由加载等逻辑

// 导入工具函数和状态管理
import { getToken } from '../utils/auth'; // 从localStorage获取token
import { useUserStore } from '../stores/userStore'; // 用户状态管理
import { usePermission } from '../utils/usePermission'; // 权限检查工具
import { addDynamicRoutes } from './utils'; // 动态添加路由的工具函数
import router from './index'; // 导入路由实例
import { ElMessage } from 'element-plus'; // 导入消息提示组件

/**
 * 全局前置守卫（最常用）
 * 执行时机：路由跳转前（刚点击链接或调用router.push时）
 * 作用：权限校验、登录拦截、动态路由加载等
 * 参数说明：
 * - to：即将前往的目标路由对象
 * - from：当前正要离开的路由对象
 * - next：控制跳转的函数（必须调用，否则路由会卡住）
 */
export const globalBeforeEach = async (to, from, next) => {
  // 1. 公共路由直接放行（如登录页、404页，不需要登录）
  console.log('================================================================================================================================');

  if (!to.meta.requiresAuth) {
    next();
    return;
  }

  // 2. 需要登录的路由：检查是否有access_token
  const access_token = getToken();
  if (!access_token) {
    // 未登录 → 跳转到登录页，并记录当前地址（登录后可跳回）
    console.log('未登录，跳转到登录页');
    next(`/login?redirect=${to.path}`);
    return;
  }

  // 3. 已登录：确保用户信息已加载（避免刷新页面后状态丢失）
  const userStore = useUserStore();
  // 确保标志存在并初始化为false
  globalBeforeEach.isRefreshingUserInfo = globalBeforeEach.isRefreshingUserInfo || false;
  // 使用闭包维护标志避免重复请求
  if (!userStore.user?.permissions && !globalBeforeEach.isRefreshingUserInfo) {
    try {
      globalBeforeEach.isRefreshingUserInfo = true;
      // 首次登录或刷新页面 → 重新获取用户信息（含权限）
      await userStore.getUser();
    } catch (error) {
      console.error('获取用户信息失败，跳转到登录页:', error);
      next(`/login?redirect=${to.path}`);
      return;
    } finally {
      globalBeforeEach.isRefreshingUserInfo = false;
    }
  }

  // 4. 加载动态路由（根据用户权限筛选并添加路由）
  // 注意：addDynamicRoutes函数内部已做路由存在性检查，不会重复添加
  try {
    await addDynamicRoutes(router, userStore.user.permissions);
  } catch (error) {
    console.error('加载动态路由失败:', error);
    next(`/login?redirect=${to.path}`);
    return;
  }

  // 5. 检查当前路由是否匹配，如果不匹配则重新导航
  // 这一步是必要的，因为动态路由可能是在本次导航期间才添加的
  const matchedRoute = router.getRoutes().find(route => route.path === to.path);
  if (!matchedRoute) {
    // 如果是404页面，直接放行
    if (to.path === '/404') {
      next();
      return;
    }
    // 使用next({ ...to, replace: true })重新触发路由匹配
    next({ ...to, replace: true });
    return;
  }

  // 6. 权限校验：检查当前用户是否有权访问目标路由
  // 6.1 检查是否需要管理员权限
  if (to.meta.isAdmin) {
    const { hasPermission } = usePermission();
    // hasPermission内部已包含isAdmin检查
    const isAdmin = hasPermission({ resource: 'admin', action: 'access' });
    if (!isAdmin) {
      // 不是管理员 → 显示提示并跳403页面
      console.log('用户不是管理员，无权限访问此路由');
      ElMessage.error('您不是管理员，无权限访问此页面');
      next('/403');
      return;
    }
  }

  // 6.2 检查是否需要特定权限
  const requiredPermission = to.meta.permission; // 路由需要的权限（格式：{ action: 'view', resource: 'report' }）
  if (requiredPermission) {
    const { hasPermission } = usePermission();
    const hasAccess = hasPermission(requiredPermission);
    if (!hasAccess) {
      // 无权限 → 显示提示并跳403页面
      ElMessage.error('您没有足够的权限访问此页面');
      next('/403');
      return;
    }
  }

  // 7. 所有校验通过 → 放行
  next();
};


export const globalAfterEach = (to, from) => {
  // 1. 设置页面标题（从路由的meta中获取）
  document.title = to.meta.title || '我的应用';

  // 2. 重置滚动条位置（进入新页面时回到顶部）
  window.scrollTo(0, 0);

  // 3. 示例：埋点统计（记录用户访问了哪个页面）
  // console.log(`用户访问了：${to.path}`);
  // console.log('路由来源：', from.path);
  // console.log('路由对象：', JSON.stringify(to));
};

/**
 * 路由独享守卫（在路由配置中使用）
 * 作用：只对单个路由生效的特殊校验（如某个页面需要额外的权限令牌）
 * 使用方式：在routes配置中添加beforeEnter属性，值为该函数
 */
// export const routeBeforeEnter = (to, from, next) => {
//   // 示例：检查是否有特殊令牌（仅对当前路由生效）
//   const specialToken = localStorage.getItem('special_token');
//   if (to.path === '/special-page' && !specialToken) {
//     // 无令牌 → 跳转到提示页
//     next('/no-permission');
//     return;
//   }
//   next(); // 有权限则放行
// };

/**
 * 组件内守卫（在组件中使用）
 * 作用：与组件生命周期结合，处理组件相关的路由逻辑
 * 使用方式：在组件的script中直接定义（见下方示例）
 */

/*
// 组件内守卫示例（在某个.vue文件中）
export default {
  // 1. 进入组件对应的路由前（组件实例未创建，不能用this）
  beforeRouteEnter(to, from, next) {
    // 示例：提前加载组件所需数据，避免页面空白
    fetchData(to.params.id).then(data => {
      // 通过next的回调将数据传递给组件（vm即组件实例）
      next(vm => vm.initData(data));
    });
  },

  // 2. 路由参数变化但组件复用（如/user/1 → /user/2）
  beforeRouteUpdate(to, from, next) {
    // 示例：重新加载数据（避免组件重复创建）
    this.fetchData(to.params.id);
    next();
  },

  // 3. 离开组件对应的路由前
  beforeRouteLeave(to, from, next) {
    // 示例：阻止未保存的表单被关闭
    if (this.formIsChanged) {
      if (confirm('表单未保存，确定离开吗？')) {
        next(); // 确认离开
      } else {
        next(false); // 取消离开
      }
    } else {
      next(); // 表单未修改，直接离开
    }
  }
};
*/
