
import { useUserStore } from '../stores/userStore';

export const usePermission = () => {
  const userStore = useUserStore();
  const userRoles=userStore.user?.roles
  
  const isAdmin = () => userRoles?.includes('admin');

  // if (isAdmin()) return true;// 管理员直接返回true
  /**
   * 资源权限检查 - 检查是否有指定资源的特定操作权限
   * @param {object} requiredPermissions - 请求权限
   * @param {string} requiredPermissions.resource - 资源名称
   * @param {string} requiredPermissions.action - 操作名称
   * @param {string} [requiredPermissions.scope] - 范围 (可选)
   * @param {number} [requiredPermissions.id] - 资源id (可选)
   * @returns {boolean} - 是否拥有该资源的操作权限
   */
  const hasPermission = (requiredPermissions) => {
    if (isAdmin()) return true;

    if (!userStore.user?.permissions) return false;

    const { resource, action, scope = null, id = null } = requiredPermissions;

    // 检查是否存在匹配的权限对象
    return userStore.user.permissions.some(perm => {
      // 匹配前两项：resource和action
      if (perm.resource !== resource || perm.action !== action) {
        return false;
      }

      // 如果用户scope为all，则不再判断其他条件
      if (perm.scope === 'all') {
        return true;
      }

      // 如果scope和id都为空，只匹配前两项
      if (!scope && !id) {
        return true;
      }

      // 如果id为空，匹配前三项
      if (!id) {
        return perm.scope === scope;
      }

      // 如果scope为own且id不为空，需要匹配id
      if (scope === 'own') {
        return perm.scope === 'own' && userStore.user.id === id;
      }

      // 其他情况：scope不为空且id不为空
      return perm.scope === scope;
    });
  }

  return {
    hasPermission,
  };
};
