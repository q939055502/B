// /**
//  * 非管理员权限业务逻辑层
//  * 负责处理与非管理员用户相关的权限业务逻辑
//  */
// import { ElMessage } from 'element-plus';
// import { permissionService as apiPermissionService } from '../api/permissionAPI';
// import { HTTP_200_OK } from '../utils/status_codes.js';
// import { adminService } from './service/adminService.js';

// /**
//  * 权限业务服务类
//  */
// export class PermissionService {
//   /**
//    * 管理员功能已移至AdminService
//    * 以下方法为兼容旧代码保留的转发调用
//    */

//   /**
//    * 获取角色列表（管理员功能）
//    * @returns {Promise<Array>} - 角色列表
//    */
//   async getRoles() {
//     return adminService.getRoles();
//   }

//   /**
//    * 获取权限列表（管理员功能）
//    * @returns {Promise<Array>} - 权限列表
//    */
//   async getPermissions() {
//     return adminService.getPermissions();
//   }

//   /**
//    * 获取角色权限（管理员功能）
//    * @param {string|number} roleId - 角色ID
//    * @returns {Promise<Array>} - 角色权限列表
//    */
//   async getRolePermissions(roleId) {
//     return adminService.getRolePermissions(roleId);
//   }

// //   /**
// //    * 获取用户权限（管理员功能）
// //    * @param {string|number} userId - 用户ID
// //    * @returns {Promise<Array>} - 用户权限列表
// //    */
// //   async getUserPermissions(userId) {
// //     return adminService.getUserPermissions(userId);
// //   }

// //   /**
// //    * 分配权限给用户（管理员功能）
// //    * @param {string|number} userId - 用户ID
// //    * @param {Object} params - 权限参数
// //    * @returns {Promise<boolean>} - 是否分配成功
// //    */
// //   async assignUserPermissions(userId, params) {
// //     return adminService.assignUserPermissions(userId, params);
// //   }

// //   /**
// //    * 创建角色（管理员功能）
// //    * @param {Object} roleData - 角色数据
// //    * @returns {Promise<Object|null>} - 创建的角色数据或null
// //    */
// //   async createRole(roleData) {
// //     return adminService.createRole(roleData);
// //   }

// //   /**
// //    * 为角色添加权限（管理员功能）
// //    * @param {string|number} roleId - 角色ID
// //    * @param {Object} params - 权限参数
// //    * @returns {Promise<boolean>} - 是否添加成功
// //    */
// //   async addRolePermissions(roleId, params) {
// //     return adminService.addRolePermissions(roleId, params);
// //   }

// //   /**
// //    * 获取用户角色（管理员功能）
// //    * @param {string|number} userId - 用户ID
// //    * @returns {Promise<Array>} - 用户角色列表
// //    */
// //   async getUserRoles(userId) {
// //     return adminService.getUserRoles(userId);
// //   }

// //   /**
// //    * 添加用户角色（管理员功能）
// //    * @param {string|number} userId - 用户ID
// //    * @param {Object} params - 角色参数
// //    * @returns {Promise<boolean>} - 是否添加成功
// //    */
// //   async addUserRoles(userId, params) {
// //     return adminService.addUserRoles(userId, params);
// //   }

// //   /**
// //    * 移除用户角色（管理员功能）
// //    * @param {string|number} userId - 用户ID
// //    * @param {string|number} roleId - 角色ID
// //    * @returns {Promise<boolean>} - 是否移除成功
// //    */
// //   async removeUserRole(userId, roleId) {
// //     return adminService.removeUserRole(userId, roleId);
// //   }
// }

// // 延迟创建单例实例
// let _permissionService;
// export function getPermissionService() {
//   if (!_permissionService) {
//     _permissionService = new PermissionService();
//   }
//   return _permissionService;
// }

// // 导出服务实例
// export const permissionService = getPermissionService();