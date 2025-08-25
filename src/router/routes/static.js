
// 静态路由（原basic.js改名）
// 基础路由（无需登录即可访问）
export default [
  
  // 认证相关路由
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: {
      requiresAuth: false,
      title: '登录'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/login/RegisterForm.vue'),
    meta: {
      requiresAuth: false,
      title: '注册'
    }
  },

  // 报告相关路由
  {
    path: '/_report',
    name: 'Report',
    component: () => import('@/views/report/ShowReportByCode.vue'),
    meta: {
      requiresAuth: false,
      title: '报告防伪查询'
    }
  },
  {
    path: '/engineering-management',
    name: 'EngineeringManagement',
    component: () => import('../../views/report/EngineeringManagement.vue'),
    meta: {
      layout: 'main',
      requiresAuth: false,
      title: '工程检测数据管理'
    }
  },

  // 个人中心路由
  {
    path: '/user/info',
    name: 'UserInfo',
    component: () => import('../../views/user/UserInfo.vue'),
    meta: {
      layout: 'main',
      requiresAuth: true,
      title: '个人中心'
    }
  },

  // 首页和错误页
  {
    path: '/home',
    name: 'Home',
    component: () => import('../../views/home/Home.vue'),
    meta: {
      layout: 'main',
      requiresAuth: false,
      title: '首页'
    }
  },
  {
    path: '/',
    name: 'Home1',
    component: () => import('../../views/home/Home.vue'),
    meta: {
      layout: 'main',
      requiresAuth: false,
      title: '首页'
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('../../views/error/NotFound.vue'),
    meta: {
      layout: 'empty',
      requiresAuth: false
    }
  },

  // 重定向：默认访问首页
//   {
//     path: '/',
//     redirect: '/home'
//   }
];
