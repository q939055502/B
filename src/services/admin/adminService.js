import { ElMessage } from 'element-plus';
import { adminService as apiAdminService } from '../../api/admin/index.js';
import { HTTP_200_OK } from '../../utils/status_codes.js';
import { useAdminStore } from '../../stores/adminStore.js';

export class AdminService {
  // 获取数据接口
  async getAllRolesWithPermissions() { // 获取所有角色及其权限
    try {
      const res = await apiAdminService.getAllRolesWithPermissions();
      const adminStore = useAdminStore();

      if (res.data?.code === HTTP_200_OK) {
        const rolesWithPermissions = res.data?.data || [];
        // 存储角色列表
        adminStore.roleList.value = rolesWithPermissions;
        
        // 提取所有角色的权限并存储
        const allPermissions = [];
        rolesWithPermissions.forEach(role => {
          if (role.permissions && Array.isArray(role.permissions)) {
            allPermissions.push(...role.permissions);
          }
        });
        
        // 去重处理
        const uniquePermissions = [...new Map(allPermissions.map(perm => [perm.id, perm])).values()];
        adminStore.rolePermissions.value = uniquePermissions;
        
        return rolesWithPermissions;
      } else {
        console.error('获取所有角色及其权限失败', res);
        ElMessage.error(`获取所有角色及其权限失败：${res.message || '未知错误'}`);
        return [];
      }
    } catch (error) {
      console.error('获取所有角色及其权限失败', error);
      ElMessage.error(`获取所有角色及其权限失败：${error.message || '未知错误'}`);
      return [];
    }
  }

  async getUsers(params = {}) { // 获取用户列表（管理员功能）
    try {
      const validatedParams = {};

      // 设置分页参数
      validatedParams.page = params.page !== undefined ? params.page : 1;
      validatedParams.per_page = params.pageSize !== undefined ? params.pageSize : 10;

      // 设置筛选参数
      if (params.keyword !== undefined) validatedParams.keyword = params.keyword;
      if (params.status !== undefined) validatedParams.status = params.status;
      if (params.roleId !== undefined) validatedParams.role_id = params.roleId;

      const res = await apiAdminService.getUsers(validatedParams);
      const result = res.data?.data || {};

      const adminStore = useAdminStore();

      adminStore.userList.value = result.list || [];
      adminStore.userListTotalCount = result.total || 0;
      
      console.log('获取用户列表原始数据:', adminStore.userListTotalCount);
      return {
        users: result.list || [],
        totalCount: result.total || 0
      };
    } catch (error) {
      console.error('获取用户列表失败:', error);
      ElMessage.error(`获取用户列表失败：${error.message || '未知错误'}`);
      return {
        users: [],
        totalCount: 0
      };
    }
  }

  async getUserById(userId) { // 获取单个用户信息
    try {
      if (!userId) {
        throw new Error('用户ID不能为空');
      }

      const res = await apiAdminService.getUserById(userId);
      return res.data?.data || res.data || null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      ElMessage.error(`获取用户信息失败：${error.message || '未知错误'}`);
      return null;
    }
  }

  async getRoles() { // 获取角色列表
    try {
      const res = await apiAdminService.getRoles();
      const adminStore = useAdminStore();

      if (res.data.code === HTTP_200_OK) {
        const roles = res.data?.data || res.data || [];
        adminStore.roleList.value = roles;
        return roles;
      } else {
        console.error('获取角色列表失败', res);
        ElMessage.error(`获取角色列表失败：${res.message || '未知错误'}`);
        adminStore.roleList.value = [];
        return [];
      }
    } catch (error) {
      console.error('获取角色列表失败', error);
      ElMessage.error(`获取角色列表失败：${error.message || '未知错误'}`);
      const adminStore = useAdminStore();
      adminStore.roleList.value = [];
      return [];
    }
  }

  async getPermissions() { // 获取权限列表
    try {
      const res = await apiAdminService.getPermissions();
      const adminStore = useAdminStore();

      if (res.data?.code === HTTP_200_OK) {
        const permissions = res.data?.data || [];
        adminStore.permissionList.value = permissions;
        return permissions;
      } else {
        console.error('获取权限列表失败', res);
        ElMessage.error(`获取权限列表失败：${res.message || '未知错误'}`);
        adminStore.permissionList.value = [];
        return [];
      }
    } catch (error) {
      console.error('获取权限列表失败', error);
      ElMessage.error(`获取权限列表失败：${error.message || '未知错误'}`);
      const adminStore = useAdminStore();
      adminStore.permissionList.value = [];
      return [];
    }
  }

  async getRolePermissions(roleId) { // 获取角色权限
    try {
      if (!roleId) {
        ElMessage.warning('角色ID不能为空');
        return [];
      }

      const res = await apiAdminService.getRolePermissions(roleId);

      if (res.data.code === HTTP_200_OK) {
        return res.data?.data || [];
      } else {
        console.error('获取角色权限失败', res);
        ElMessage.error(`获取角色权限失败：${res.message || '未知错误'}`);
        return [];
      }
    } catch (error) {
      console.error('获取角色权限失败', error);
      ElMessage.error(`获取角色权限失败：${error.message || '未知错误'}`);
      return [];
    }
  }

  async getUserPermissions(userId) { // 获取用户权限
    try {
      if (!userId) {
        ElMessage.warning('用户ID不能为空');
        return [];
      }

      const res = await apiAdminService.getUserPermissions(userId);

      if (res.data.code === HTTP_200_OK) {
        return res.data?.data || res.data || [];
      } else {
        console.error('获取用户权限失败', res);
        ElMessage.error(`获取用户权限失败：${res.message || '未知错误'}`);
        return [];
      }
    } catch (error) {
      console.error('获取用户权限失败', error);
      ElMessage.error(`获取用户权限失败：${error.message || '未知错误'}`);
      return [];
    }
  }

  async getUserRoles(userId) { // 获取用户角色
    try {
      if (!userId) {
        ElMessage.warning('用户ID不能为空');
        return [];
      }

      const res = await apiAdminService.getUserRoles(userId);
      if (res.data.code === HTTP_200_OK) {
        return res.data?.data || res.data || [];
      } else {
        console.error('获取用户角色失败', res);
        ElMessage.error(`获取用户角色失败：${res.message || '未知错误'}`);
        return [];
      }
    } catch (error) {
      console.error('获取用户角色失败', error);
      ElMessage.error(`获取用户角色失败：${error.message || '未知错误'}`);
      return [];
    }
  }

  // 更新数据接口
  async createUser(userData) { // 创建新用户
    try {
      if (!userData.username || !userData.email || !userData.password) {
        throw new Error('用户名、邮箱和密码不能为空');
      }

      const formattedData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        nickname: userData.nickname,
        role_ids: [userData.roleId],
        status: userData.status
      };
      console.log('创建用户:', formattedData);

      const res = await apiAdminService.createUser(formattedData);

      if (res.data?.success) {
        ElMessage.success('创建用户成功');
        return true;
      } else {
        throw new Error(res.data?.message || '创建用户失败');
      }
    } catch (error) {
      console.error('创建用户失败:', error);
      ElMessage.error(`创建用户失败：${error.message || '未知错误'}`);
      return false;
    }
  }

  async updateUser(userId, userData) { // 更新用户信息
    try {
      if (!userId) {
        throw new Error('用户ID不能为空');
      }
      
      // 参数验证
      if (userData) {
        // 邮箱验证
        if (userData.email && !/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(userData.email)) {
          throw new Error('邮箱格式不正确');
        }
        
        // 身份证号验证
        if (userData.idCard && !/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(userData.idCard)) {
          throw new Error('身份证号格式不正确');
        }
        
        // 日期验证 (例如: 生日、有效期等)
        if (userData.birthDate && !/^(\d{4})-(\d{2})-(\d{2})$/.test(userData.birthDate)) {
          throw new Error('出生日期格式不正确，请使用YYYY-MM-DD格式');
        }
        
        // 手机号码验证
        if (userData.phone_number && !/^1[3-9]\d{9}$/.test(userData.phone_number)) {
          throw new Error('手机号码格式不正确，请输入11位有效的手机号码');
        }
      }
      
      console.log('更新用户信息:', userId, userData);

      const res = await apiAdminService.updateUser(userId, userData);

      if (res.data?.success) {
        ElMessage.success('更新用户成功');
        return true;
      } else {
        throw new Error(res.data?.message || '更新用户失败');
      }
    } catch (error) {
      console.error('更新用户失败:', error);
      ElMessage.error(`更新用户失败：${error.message || '未知错误'}`);
      return false;
    }
  }

  async deleteUser(userId) { // 删除用户
    try {
      if (!userId) {
        throw new Error('用户ID不能为空');
      }

      const res = await apiAdminService.deleteUser(userId);

      if (res.data?.success) {
        ElMessage.success('删除用户成功');
        return true;
      } else {
        throw new Error(res.data?.message || '删除用户失败');
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      ElMessage.error(`删除用户失败：${error.message || '未知错误'}`);
      return false;
    }
  }

  async updateUserStatus(userId, status) { // 更新人员状态
    try {
      if (!userId) {
        throw new Error('用户ID不能为空');
      }

      if (![0, 1, 2].includes(Number(status))) {
        throw new Error('无效的状态值，必须是0(禁用)、1(正常)或2(待验证)');
      }

      // 参数格式化，将userId映射为staff_id
      const formattedData = {
        staff_id: userId,
        status: status
      };
      const res = await apiAdminService.updateUserStatus(formattedData);

      if (res.data?.success) {
        ElMessage.success(`用户状态已${status === 1 ? '启用' : '禁用'}`);
        return true;
      } else {
        throw new Error(res.data?.message || '更新用户状态失败');
      }
    } catch (error) {
      console.error('更新用户状态失败:', error);
      ElMessage.error(`更新用户状态失败：${error.message || '未知错误'}`);
      return false;
    }
  }

  async createRole(roleData) { // 创建角色
    try {
      if (!roleData || !roleData.name) {
        ElMessage.warning('角色名称不能为空');
        return null;
      }

      const res = await apiAdminService.createRole(roleData);
      if (res.code === HTTP_200_OK) {
        ElMessage.success('角色创建成功');
        return res.data?.data || res.data || null;
      } else {
        console.error('创建角色失败', res);
        ElMessage.error(`创建角色失败：${res.message || '未知错误'}`);
        return null;
      }
    } catch (error) {
      console.error('创建角色失败', error);
      ElMessage.error(`创建角色失败：${error.message || '未知错误'}`);
      return null;
    }
  }

  async addRolePermissions(roleId, params) { // 为角色添加权限
    try {
      if (!roleId) {
        ElMessage.warning('角色ID不能为空');
        return false;
      }

      if (!params || !params.permissions) {
        ElMessage.warning('请提供权限数据');
        return false;
      }

      const res = await apiAdminService.addRolePermissions(roleId, params);
      if (res.code === HTTP_200_OK) {
        ElMessage.success('权限添加成功');
        return true;
      } else {
        console.error('添加角色权限失败', res);
        ElMessage.error(`添加角色权限失败：${res.message || '未知错误'}`);
        return false;
      }
    } catch (error) {
      console.error('添加角色权限失败', error);
      ElMessage.error(`添加角色权限失败：${error.message || '未知错误'}`);
      return false;
    }
  }

  async addUserRoles(userId, params) { // 添加用户角色
    try {
      if (!userId) {
        ElMessage.warning('用户ID不能为空');
        return false;
      }

      if (!params || !params.roles) {
        ElMessage.warning('请提供角色数据');
        return false;
      }

      const res = await apiAdminService.addUserRoles(userId, params);
      if (res.code === HTTP_200_OK) {
        ElMessage.success('角色添加成功');
        return true;
      } else {
        console.error('添加用户角色失败', res);
        ElMessage.error(`添加用户角色失败：${res.message || '未知错误'}`);
        return false;
      }
    } catch (error) {
      console.error('添加用户角色失败', error);
      ElMessage.error(`添加用户角色失败：${error.message || '未知错误'}`);
      return false;
    }
  }

  async removeUserRole(userId, roleId) { // 移除用户角色
    try {
      if (!userId) {
        ElMessage.warning('用户ID不能为空');
        return false;
      }

      if (!roleId) {
        ElMessage.warning('角色ID不能为空');
        return false;
      }

      const res = await apiAdminService.removeUserRole(userId, roleId);
      if (res.code === HTTP_200_OK) {
        ElMessage.success('角色移除成功');
        return true;
      } else {
        console.error('移除用户角色失败', res);
        ElMessage.error(`移除用户角色失败：${res.message || '未知错误'}`);
        return false;
      }
    } catch (error) {
      console.error('移除用户角色失败', error);
      ElMessage.error(`移除用户角色失败：${error.message || '未知错误'}`);
      return false;
    }
  }

  async updateUserPermissions(userId, params) { // 更新用户权限
    try {
      if (!userId) {
        ElMessage.warning('用户ID不能为空');
        return false;
      }

      if (!params || !params.permission_ids) {
        ElMessage.warning('请提供权限ID数组');
        return false;
      }

      const res = await apiAdminService.updateStaffPermissions(userId, params);
      if (res.data?.success) {
        ElMessage.success('更新用户权限成功');
        return true;
      } else {
        throw new Error(res.data?.message || '更新用户权限失败');
      }
    } catch (error) {
      console.error('更新用户权限失败:', error);
      ElMessage.error(`更新用户权限失败：${error.message || '未知错误'}`);
      return false;
    }
  }

  async updateUserRole(userId, params) { // 更新用户角色
    try {
      if (!userId) {
        ElMessage.warning('用户ID不能为空');
        return false;
      }

      if (!params || !params.roleId) {
        ElMessage.warning('请提供角色ID');
        return false;
      }

      // 格式化参数，后端接口需要role_ids数组
      const formattedData = {
        role_ids: [params.roleId]
      };

      const res = await apiAdminService.updateUserRole(userId, formattedData);
      if (res.data?.success) {
        ElMessage.success('角色更新成功');
        return true;
      } else {
        throw new Error(res.data?.message || '更新用户角色失败');
      }
    } catch (error) {
      console.error('更新用户角色失败:', error);
      ElMessage.error(`更新用户角色失败：${error.message || '未知错误'}`);
      return false;
    }
  }
}

// 延迟创建单例实例
let _adminService;
export function getAdminService() {
  if (!_adminService) {
    _adminService = new AdminService();
  }
  return _adminService;
}

export const adminService = getAdminService();