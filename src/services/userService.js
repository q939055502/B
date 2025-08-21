/**
 * 非管理员用户业务逻辑层
 * 负责处理与非管理员用户相关的业务逻辑，包括API调用、数据处理、业务规则执行等
 */
import { userAPI as apiUserService } from '../api/userAPI';
import { adminService } from './admin/adminService.js';
// 延迟导入 useUserStore 以避免循环依赖
let useUserStore;
// 在需要时动态导入
const getUseUserStore = async () => {
  if (!useUserStore) {
    const module = await import('../stores/userStore');
    useUserStore = module.useUserStore;
  }
  return useUserStore;
};
import { ElMessage } from 'element-plus';
import router from '../router';
import { setToken, removeToken, setRefresh_token, removeRefresh_token, getToken, setUserInfo } from '../utils/auth';
import { addDynamicRoutes } from '../router/utils.js';

/**
 * 用户业务服务类
 */
export class UserService {
  constructor() {
    // 延迟初始化userStore
    this._userStore = null;
  }

  /**
   * 发送密码重置验证码
   * @param {string} email - 用户邮箱
   * @returns {Promise<boolean>} - 是否发送成功
   */
  async sendResetCode(email) {
    try {
      if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        throw new Error('请输入有效的邮箱地址');
      }

      const res = await apiUserService.sendResetCode({
        email: email
      });

      if (res.data?.success) {
        ElMessage.success('重置验证码已发送到您的邮箱');
        return true;
      } else {
        throw new Error(res.data?.message || '发送重置验证码失败');
      }
    } catch (error) {
      console.error('发送重置验证码异常', error);
      ElMessage.error(`发送重置验证码失败：${error.message || '未知错误'}`);
      return false;
    }
  }

  /**
   * 重置密码（通过验证码）
   * @param {string} email - 用户邮箱
   * @param {string} code - 验证码
   * @param {string} newPassword - 新密码
   * @param {string} confirmPassword - 确认新密码
   * @returns {Promise<boolean>} - 是否重置成功
   */
  async resetPasswordByCode(email, code, newPassword, confirmPassword) {
    try {
      if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        throw new Error('请输入有效的邮箱地址');
      }

      if (!code) {
        throw new Error('请输入验证码');
      }

      if (!newPassword || newPassword.length < 6) {
        throw new Error('新密码长度不能少于6位');
      }

      // 密码规则强化：确保包含字母和数字
      if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
        throw new Error('密码必须同时包含字母和数字');
      }

      if (newPassword !== confirmPassword) {
        throw new Error('两次输入的密码不一致');
      }

      const res = await apiUserService.resetPasswordByCode({
        email: email,
        code: code,
        new_password: newPassword,
        confirm_password: confirmPassword
      });

      if (res.data?.success) {
        ElMessage.success('密码重置成功，请使用新密码登录');
        return true;
      } else {
        throw new Error(res.data?.message || '重置密码失败');
      }
    } catch (error) {
      console.error('重置密码异常', error);
      ElMessage.error(`重置密码失败：${error.message || '未知错误'}`);
      return false;
    }
  }

  /**
   * 发送注册验证码
   * @param {string} email - 用户邮箱
   * @returns {Promise<boolean>} - 是否发送成功
   */
  async sendRegisterCode(email) {
      try {
        if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
          throw new Error('请输入有效的邮箱地址');
        }

        const res = await apiUserService.sendRegisterCode({
          email: email
        });

        if (res.data?.success) {
          ElMessage.success('注册验证码已发送到您的邮箱');
          return true;
        } else {
          throw new Error(res.data?.message || '发送注册验证码失败');
        }
      } catch (error) {
        console.error('发送注册验证码异常', error);
        ElMessage.error(`发送注册验证码失败：${error.message || '未知错误'}`);
        return false;
      }
    }
  
    /**
     * 处理用户注册业务逻辑
     * @param {Object} registerForm - 注册表单数据
     * @returns {Promise<boolean>} - 注册是否成功
     */
  async register(registerForm) {
      try {
        if (!registerForm.username || !registerForm.username.trim()) {
          throw new Error('请输入用户名');
        }
  
        if (!registerForm.nickname || !registerForm.nickname.trim()) {
          throw new Error('请输入昵称');
        }
  
        if (!registerForm.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(registerForm.email)) {
          throw new Error('请输入有效的邮箱地址');
        }
  
        if (!registerForm.password || registerForm.password.length < 6) {
        throw new Error('密码长度不能少于6位');
      }

      // 密码规则强化：确保包含字母和数字
      if (!/[A-Za-z]/.test(registerForm.password) || !/[0-9]/.test(registerForm.password)) {
        throw new Error('密码必须同时包含字母和数字');
      }
  
        if (!registerForm.email_code) {
          throw new Error('请输入验证码');
        }
  
        const res = await apiUserService.register(registerForm);
  
        if (res.data?.success) {
          ElMessage.success('注册成功，请登录');
          return true;
        } else {
          throw new Error(res.data?.message || '注册失败');
        }
      } catch (error) {
        console.error('注册异常', error);
        ElMessage.error(`注册失败：${error.message || '未知错误'}`);
        return false;
      }
    }
  
    // 确保获取到userStore
  async getUserStore() {
    if (!this._userStore) {
      const useStore = await getUseUserStore();
      this._userStore = useStore();
    }
    return this._userStore;
  }

  /**
 * 处理用户登录业务逻辑
 * @param {Object} loginForm - 登录表单数据
 * @returns {Promise<boolean>} - 登录是否成功
 */
async handleLogin(loginForm) {
    try {
      // 调用API服务进行登录
      const res = await apiUserService.login({
        username: loginForm.username,
        password: loginForm.password,
        remember_me: loginForm.rememberMe
      });

      // 根据记住我状态存储用户名
      if (loginForm.rememberMe) {
        localStorage.setItem('remembered_username', loginForm.username);
      } else {
        localStorage.removeItem('remembered_username');
      }

      // 检查响应格式
      if (!res.data) {
        throw new Error(res.data?.message || '登录失败：无效的响应');
      }

      // 处理登录成功逻辑
      const { access_token: newToken, refresh_token: newRefreshToken } = res.data;
      const {user: userData } = res.data.data;

      // 更新用户状态
      const userStore = await this.getUserStore();
      userStore.setUser(userData);
      // 使用auth.js中的setToken方法统一存储令牌
      setToken({ access_token: newToken, refresh_token: newRefreshToken });
      userStore.access_token = newToken;
      userStore.refresh_token = newRefreshToken;
      // 存储用户信息到本地
      setUserInfo(userData);
      
      // 获取用户权限
      const permissions = userData.permissions || [];
      
      // 无论是否有权限，都尝试添加动态路由
      // 有些公共路由可能不需要特定权限
      addDynamicRoutes(router, permissions);
      
      if (permissions.length === 0) {
        ElMessage.warning('未获取到用户权限，可能无法访问所有功能');
      }


      // 跳转至目标页面（优先跳转登录前的页面，否则去首页）
      const currentRoute = router.currentRoute.value;
      const redirectPath = currentRoute.query.redirect || '/home';
      router.push(redirectPath);

      return true;
    } catch (error) {
      console.error('登录失败', error);
      ElMessage.error(`登录失败：${error.message || '未知错误'}`);
      return false;
    }
  }

  /**
   * 处理用户退出登录业务逻辑
   * @returns {Promise<void>}
   */
  async handleLogout() {
    try {
      // 调用API服务进行登出
      const userStore = await this.getUserStore();
      await apiUserService.logout({
        refresh_token: userStore.refresh_token
      });
      ElMessage.success('登出成功');
    } catch (error) {
      console.error('后端登出失败', error);
      // ElMessage.warning('后端登出失败，但仍清除本地状态');
    } finally {
      // 清除本地状态
      const userStore = await this.getUserStore();

      // 清除本地存储
      removeToken();
      removeRefresh_token();
      
      // 清空userStore
      userStore.user = null;
      userStore.access_token = '';
      userStore.refresh_token = '';

      // 重定向到登录页由UI层处理
      // router.push('/login');
    }
  }

  




  /**
   * 获取当前登录用户信息
   * @returns {Promise<Object>} - 用户信息
   */
  async handleGetUser() {
    try {
      const res = await apiUserService.getUser();
      if(res.data.success){
          const userData = res.data?.data || null;
          if (userData) {
            const userStore = await this.getUserStore();
            userStore.setUser(userData);
            return userData;
          } else {
            throw new Error('获取用户信息失败: 未返回有效数据');
          }
      }

    } catch (error) {
      console.error('获取用户信息失败:', error);
      ElMessage.error(`获取用户信息失败：${error.message || '未知错误'}`);
      throw error;
    }
  }

  /**
   * 检查登录状态
   * @returns {Promise<boolean>} - 是否处于登录状态
   */
  async checkLoginStatus() {
    try {
      const res = await apiUserService.checkLogin();
      if (res.data?.success) {
        // 登录状态有效
        const userStore = await this.getUserStore();
        userStore.access_token = getToken('access_token');
        userStore.refresh_token = getToken('refresh_token');
        userStore.user = res.data.data?.user || null;
        return true;
      } else {
        // 登录状态无效，清除本地状态
        await this.handleLogout();
        return false;
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
      // 区分错误类型
      if (error.code === 'INVALID_JSON_RESPONSE' || error.code === 'UNEXPECTED_RESPONSE_FORMAT') {
        // 响应格式错误，不是登录状态问题
        console.error(`服务器响应格式错误: ${error.message}`);
        return false;
      } else if (error.response && error.response.status === 401) {
        // 401错误，登录状态无效
        await this.handleLogout();
        return false;
      } else {
        // 其他错误，不清除登录状态
        console.error(`检查登录状态时发生错误: ${error.message || '未知错误'}`);
        return false;
      }
    }
  }


  /**
   * 更新当前登录用户信息
   * @param {Object} userData - 用户信息数据
   * @returns {Promise<boolean>} - 是否更新成功
   */
  async updateCurrentUser(userData) {
    try {
      const res = await apiUserService.updateCurrentUser(userData);
      if (res.data?.success) {
        return true;
      } else {
        throw new Error(res.data?.message || '更新用户信息失败');
      }
    } catch (error) {
      console.error('更新用户信息异常', error);
      throw new Error(`更新用户信息失败：${error.message || '未知错误'}`);
    }
  }

}

// 延迟创建单例实例
let _userService;
export function getuserService() {
  if (!_userService) {
    _userService = new UserService();
  }
  return _userService;
}

// 导出服务实例
export const userService = getuserService();