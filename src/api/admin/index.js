import request from '../index';

export const adminService = {
  // 获取数据接口
  getAllRolesWithPermissions: () => {
    return request.get('/api/admin/get_all_roles_with_permissions');
  }, // 获取所有角色及其权限

  getUsers: (params) => {
    return request.get('/api/admin/get_staff_list', {
      params: params
    });
  }, // 获取用户列表

  getUserById: (userId) => {
    return request.get(`/api/admin/get_staff_detail/${userId}`);
  }, // 获取单个用户信息

  getRoles: () => {
    return request.get('/api/admin/get_role_list');
  }, // 获取角色列表

  getPermissions: () => {
    return request.get('/api/admin/get_permissions_list');
  }, // 获取权限列表

  getRolePermissions: (roleId) => {
    return request.get(`/api/admin/get_role_permissions/${roleId}`);
  }, // 获取角色权限

  getUserRoles: (staffId) => {
    return request.get(`/api/admin/get_staff_role/${staffId}`);
  }, // 获取用户角色

  getUserPermissions: (staffId) => {
    return request.get(`/api/admin/get_staff_permissions/${staffId}`);
  }, // 获取用户权限

  // 更新数据接口
  createUser: (userData) => {
    return request.post('/api/admin/create_staff', userData);
  }, // 创建新用户，参数格式化在服务层完成

  deleteUser: (staffId) => {
    return request.delete(`/api/admin/delete_staff/${staffId}`);
  }, // 删除人员

  updateUserRole: (staffId, roleData) => {
    return request.post(`/api/admin/update_staff_roles/${staffId}`, roleData);
  }, // 更新人员角色

  updateUserStatus: (formattedData) => {
    return request.post('/api/admin/update_staff_status', formattedData);
  }, // 更新用户状态，参数格式化在服务层完成

  updateUser: (staffId, userData) => {
    return request.post(`/api/admin/update_staff/${staffId}`, userData);
  }, // 更新用户信息

  updateStaffPermissions: (staffId, params) => {
    return request.post(`/api/admin/update_staff_permissions/${staffId}`, params);
  }, // 更新人员权限

  createRole: (roleData) => {
    return request.post('/api/admin/roles', roleData);
  }, // 创建角色
};