
import dynamicRoutes from './routes/dynamic';// 导入动态路由
import { usePermission } from '../utils/usePermission';// 导入权限工具
import router from './index';// 导入路由实例

/**
 * 按权限筛选路由：只保留用户有权限访问的路由
 * @param {Array} routes - 路由列表
 * @param {Array} userPermissions - 用户权限列表
 * @returns {Array} 筛选后的路由列表
 */
export const filterRoutesByPermission = (routes, userPermissions) => {
  const { hasPermission } = usePermission();
  return routes.filter(route => {
    // 路由没有权限限制 → 直接通过
    if (!route.meta?.permission) return true;
    // 检查用户是否有路由所需的权限
    return hasPermission(route.meta.permission);
  });
};

/**
 * 动态添加路由到路由实例
 * @param {Router} router - 路由实例
 * @param {Array} userPermissions - 用户权限列表
 */
export const addDynamicRoutes = (router, userPermissions = []) => {
  console.log('开始添加动态路由...');
  console.log('用户权限:', userPermissions);
  
  // 首先添加所有不需要登录的路由
  const publicRoutes = dynamicRoutes.filter(route => !route.meta?.requiresAuth);
  console.log('不需要登录的路由:', publicRoutes);
  
  publicRoutes.forEach(route => {
    if (!router.hasRoute(route.name)) {
      console.log('添加公共路由:', route.name, route.path);
      router.addRoute(route);
    }
  });
  
  // 然后添加需要登录的路由
  const privateRoutes = dynamicRoutes.filter(route => route.meta?.requiresAuth);
  
  // 分成两类: 需要特定权限的路由和不需要特定权限的路由
  const routesWithPermission = privateRoutes.filter(route => route.meta?.permission);
  const routesWithoutPermission = privateRoutes.filter(route => !route.meta?.permission);
  
  // 添加不需要特定权限的登录路由
  routesWithoutPermission.forEach(route => {
    if (!router.hasRoute(route.name)) {
      console.log('添加无需特定权限的登录路由:', route.name, route.path);
      router.addRoute(route);
    }
  });
  
  // 添加需要特定权限的路由
  if (userPermissions.length) {
    const accessibleRoutes = filterRoutesByPermission(routesWithPermission, userPermissions);
    console.log('筛选后的需要权限的路由:', accessibleRoutes);
    
    accessibleRoutes.forEach(route => {
      if (!router.hasRoute(route.name)) {
        console.log('添加需要权限的路由:', route.name, route.path);
        router.addRoute(route);
      }
    });
  }

  // 兜底路由
  if (!router.hasRoute('NotFoundRedirect')) {
    router.addRoute({
      name: 'NotFoundRedirect',
      path: '/:pathMatch(.*)*',
      redirect: '/404'
    });
    console.log('添加兜底路由');
  }
};

/**
 * 根据前缀删除路由
 * @param {Router} router - 路由实例
 * @param {string} prefix - 路由前缀
 */
export const removeRoutesByPrefix = (router, prefix) => {
  const routes = router.getRoutes();
  routes.forEach(route => {
    if (route.path.startsWith(prefix)) {
      router.removeRoute(route.name);
    }
  });
};

/**
 * 重置路由为初始状态（如退出登录时）
 * @param {Router} router - 路由实例
 * @param {Array} baseRoutes - 基础路由列表
 */
export const resetRoutes = (router, baseRoutes) => {
  // 1. 删除所有动态路由
  removeRoutesByPrefix(router, '/user'); // 假设动态路由都以 '/user' 开头
  
  // 2. 添加基础路由
  baseRoutes.forEach(route => {
    router.addRoute(route);
  });
};

/**
 * 从路由中提取可显示在侧边栏的菜单路由
 * @param {Array} routes - 路由列表
 * @returns {Array} 菜单路由列表
 */
export const getMenuRoutes = (routes) => {
  return routes.filter(route => {
    // 只返回有 meta.menuTitle 的路由（即侧边栏菜单路由）
    return route.meta?.menuTitle;
  });
};

/**
 * 从路由中提取面包屑导航路由
 * @param {Array} routes - 路由列表
 * @returns {Array} 面包屑导航路由列表
 */
export const getBreadcrumbRoutes = (routes) => {
  return routes.filter(route => {
    // 只返回有 meta.breadcrumbTitle 的路由（即面包屑导航路由）
    return route.meta?.breadcrumbTitle;
  });
};

/**
 * 获取路由的面包屑路径
 * @param {Route} route - 路由对象
 * @returns {string} 面包屑路径
 */
export const getBreadcrumbPath = (route) => {
  // 1. 基础路径（不包含参数）
  let path = route.path;
  // 2. 处理动态参数（如 :id）
  const params = route.params;
  if (params) {
    Object.keys(params).forEach(key => {
      path = path.replace(`:${key}`, params[key]);
    });
  }
  return path;
};

/**
 * 将嵌套路由 “扁平化”（方便查找某个路由）
 * @param {Array} routes - 嵌套路由列表
 * @returns {Array} 扁平化后的路由列表
 */
export const flattenRoutes = (routes) => {
  const flatRoutes = [];
  const flatten = (routes) => {
    routes.forEach(route => {
      flatRoutes.push(route);
      if (route.children) {
        flatten(route.children);
      }
    });
  };
  flatten(routes);
  return flatRoutes;
};

/**
 * 检查用户是否有权访问某个路由
 * @param {Route} route - 路由对象
 * @returns {boolean} 是否有权限
 */
export const hasRoutePermission = (route) => {
  // 1. 路由没有权限限制 → 直接通过
  if (!route.meta?.permission) return true;
  // 2. 检查用户是否有路由所需的权限
  const { hasPermission } = usePermission();
  return hasPermission(route.meta.permission);
};

// 定义公开路由列表
const publicRoutes = ['/login', '/404'];

/**
 * 判断路由是否为公开路由（无需登录）
 * @param {Route} route - 路由对象
 * @returns {boolean} 是否为公开路由
 */
export const isPublicRoute = (route) => {
  // 1. 检查路由是否有 meta.public 属性
  if (route.meta?.public) return true;
  // 2. 检查路由是否在公开路由列表中
  return publicRoutes.includes(route.path);
};

/**
 * 从路由中提取指定参数（如从/user/:id中提取id）
 * @param {Route} route - 路由对象
 * @param {Array} keys - 要提取的参数键列表
 * @returns {Object} 提取的参数对象
 */
export const getRouteParams = (route, keys) => {
  const params = {};
  keys.forEach(key => {
    params[key] = route.params[key];
  });
  return params;
};

/**
 * 根据路由名称和参数生成完整路径
 * @param {string} routeName - 路由名称
 * @param {Object} params - 路由参数
 * @returns {string} 完整路径
 */
export const generateRoutePath = (routeName, params) => {
  let path = router.resolve({ name: routeName }).path;
  Object.keys(params).forEach(key => {
    path = path.replace(`:${key}`, params[key]);
  });
  return path;
};

