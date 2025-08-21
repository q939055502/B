// 管理人员相关路由
// 这些路由需要管理员权限才能访问

/**
 * @description 人员管理路由
 * @param {String} path - 路由路径
 * @param {String} name - 路由名称
 * @param {Function} component - 路由组件
 * @param {Object} meta - 路由元信息
 * @param {Boolean} meta.requiresAuth - 是否需要登录
 * @param {Boolean} meta.isAdmin - 是否需要管理员权限
 * @param {String} meta.title - 页面标题
 * @param {String} meta.layout - 布局类型
 */

export default [
  {
    path: '/manager',
    name: 'Manager',
    component: () => import('@/views/manager/ManagerLayout.vue'),
    meta: {
      layout: 'main',
      requiresAuth: true,
      // isAdmin: true,
      permission: { resource: 'user',action: 'view',scope: 'all'},
      title: '管理中心'
    },
    redirect: '/manager/users',
    children: [
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/views/manager/UserManagement.vue'),
        meta: {
          requiresAuth: true,
          // isAdmin: true,
          title: '人员管理'
        }
      },
      {
        path: 'users/create',
        name: 'CreateUser',
        component: () => import('@/views/manager/UserForm.vue'),
        meta: {
          requiresAuth: true,
          // isAdmin: true,
          title: '添加人员',
          permission: { resource: 'user',action: 'create',scope: 'all'}
        }
      },
      {
        path: 'users/:id/edit',
        name: 'EditUser',
        component: () => import('@/views/manager/UserForm.vue'),
        meta: {
          requiresAuth: true,
          // isAdmin: true,
          title: '编辑人员',
          permission: { resource: 'user',action: 'update',scope: 'all'}
        }
      },
      {
        path: 'users/:id/permission',
        name: 'UserPermission',
        component: () => import('@/views/manager/UserPermission.vue'),
        meta: {
          requiresAuth: true,
          // isAdmin: true,
          title: '权限分配',
          permission: { resource: 'user',action: 'update',scope: 'all'}
        }
      }
    ]
  }
];