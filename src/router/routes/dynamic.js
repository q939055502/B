// 动态路由（按权限拆分）
// 按权限定义需要动态添加的路由（只有拥有对应权限的用户才能看到）：


// 动态路由：根据用户权限加载
export default [
  // 所有登录用户都能访问的路由（不限制权限）

  // 登录页面（不需要认证）
  

  // 需要特定权限才能访问的路由
  
  // 需要查看权限测试页面权限的用户能访问的路由
  { 
    path: '/tt',
    name: 'tt',
    component: () => import('../../views/test.vue'),
    meta: {
      layout: 'main',
      requiresAuth: true,
      title: '权限测试',
      permission: { resource: 'user',action: 'delete',scope: 'own' }
    }
  },
  



  // 删除了错误的重定向路由
  // 报告管理路由（需要查看报告权限）
  // { 
  //   path: '/report/report-list',
  //   name: 'ReportList',
  //   component: () => import('../../views/report/ReportList.vue'),
  //   meta: {
  //     layout: 'main',
  //     requiresAuth: true,
  //     title: '报告管理',
  //     permission: { action: 'view', resource: 'report' }
  //   }
  // }
];

