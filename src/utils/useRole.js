

/**
 * 角色判断工具（composable 函数）
 * 提供角色检查相关的方法，用于判断用户是否拥有特定角色
 */
import { useUserStore } from '../stores/userStore';

export const useRole = () => {
  const userStore = useUserStore();

  /**
   * 判断用户是否拥有指定角色
   * @param {string} role - 要检查的角色名称
   * @returns {boolean} - 是否拥有该角色
   */
  const hasRole = (role) => {
    // 增加空值检查，防止roles未定义导致的错误
    return userStore.roles?.includes(role) || false;
  };

  /**
   * 检查用户是否为管理员角色
   * @returns {boolean} - 是否为管理员
   */
  const isAdmin = () => {
    return hasRole('admin');
  };

  /**
   * 检查用户是否为编辑者角色
   * @returns {boolean} - 是否为编辑者
   */
  const isEditor = () => {
    return hasRole('editor');
  };

  /**
   * 检查用户是否为查看者角色
   * @returns {boolean} - 是否为查看者
   */
  const isViewer = () => {
    return hasRole('viewer');
  };

  /**
   * 检查用户是否为普通用户角色
   * @returns {boolean} - 是否为普通用户
   */
  const isUser = () => {
    return hasRole('user');
  };

  /**
   * 检查用户是否拥有指定角色列表中的任意一个角色
   * @param {string[]} roles - 要检查的角色列表
   * @returns {boolean} - 是否拥有任意一个角色
   */
  const hasAnyRole = (roles) => {
    if (!Array.isArray(roles) || roles.length === 0) return false;
    return roles.some(role => hasRole(role));
  };

  /**
   * 检查用户是否拥有指定角色列表中的所有角色
   * @param {string[]} roles - 要检查的角色列表
   * @returns {boolean} - 是否拥有所有角色
   */
  const hasAllRoles = (roles) => {
    if (!Array.isArray(roles) || roles.length === 0) return false;
    return roles.every(role => hasRole(role));
  };

  /**
   * 获取用户拥有的所有角色
   * @returns {string[]} - 用户角色列表
   */
  const getUserRoles = () => {
    return userStore.roles || [];
  };

  /**
   * 检查用户是否为访客（没有任何角色）
   * @returns {boolean} - 是否为访客
   */
  const isGuest = () => {
    return !userStore.roles || userStore.roles.length === 0;
  };

  return {
    hasRole,
    hasAnyRole,
    hasAllRoles,
    getUserRoles,
    isAdmin,
    isEditor,
    isViewer,
    isUser,
    isGuest
  };
};
