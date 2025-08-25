// 导入上面创建的全局 axios 实例
/**
 * 用户相关API服务
 * @description 封装非管理员用户接口
 */
import request from './index';

/**
 * 用户服务对象
 * @description 包含所有用户相关的API方法
 */
export const userAPI = {

  /**
   * 用户登录
   * @param {Object} params - 登录参数
   * @param {string} params.username - 用户名
   * @param {string} params.password - 密码
   * @param {boolean} params.remember_me - 是否记住我
   * @returns {Promise<Object>} - 登录结果，包含令牌信息
   */
  login: (params) => {
    return request.post('/api/user/login', params);
  },

  /**
   * 获取用户信息（登录后调用）
   * @returns {Promise<Object>} - 用户信息，包含基本资料和权限等
   */
  getUser: () => {
    return request.get('/api/user/get-user-info');
  },

  /**
   * 退出登录
   * @param {Object} params - 退出参数
   * @returns {Promise<Object>} - 退出结果
   */
  logout: (params) => {
    return request.post('/api/user/logout', params);
  },


  /**
   * 刷新令牌
   * @description 调用此接口刷新访问令牌，由axios拦截器自动处理令牌更新
   * @returns {Promise<Object>} - 刷新结果，包含新的令牌
   */
  refreshToken: () => {
    // 注意：不需要手动设置refresh_token到请求头
    // 请求拦截器会自动处理刷新令牌请求
    return request.post('/api/auth/refresh');
  },


  /**
   * 检查登录状态
   * @returns {Promise<Object>} - 登录状态检查结果
   */
  checkLogin: () => {
    return request.get('/api/auth/verify');
  },


  /**
   * 用户注册
   * @param {Object} registerForm - 注册表单数据
   * @param {string} registerForm.username - 用户名
   * @param {string} registerForm.nickname - 昵称
   * @param {string} registerForm.email - 邮箱
   * @param {string} registerForm.password - 密码
   * @param {string} registerForm.email_code - 邮箱验证码
   * @returns {Promise<Object>} - 注册结果
   */
  register: (registerForm) => {
    return request.post('/api/user/register', {
      username: registerForm.username,
      nickname: registerForm.nickname,
      email: registerForm.email,
      password: registerForm.password,
      email_code: registerForm.email_code,
      code_type: 'register'
    });
  },

//注册发送验证接口
  sendRegisterCode: (params) => {
    return request.post('/api/user/send-register-code', {
      email: params.email,
      code_type: 'register'
    });
  },

  /**
   * 发送密码重置验证码
   * @param {Object} params - 参数对象
   * @param {string} params.email - 用户邮箱
   * @returns {Promise<Object>} - 发送结果
   */
  sendResetCode: (params) => {
    return request.post('/api/user/send-reset-code', {
      email: params.email,
      code_type: 'reset_password'
    });
  },

  /**
   * 重置密码（通过验证码）
   * @param {Object} params - 参数对象
   * @param {string} params.email - 用户邮箱
   * @param {string} params.code - 验证码
   * @param {string} params.new_password - 新密码
   * @param {string} params.confirm_password - 确认新密码
   * @returns {Promise<any>} - 重置结果
   */
  resetPasswordByCode: (params) => {
    return request.post('/api/user/reset-password-by-code', {
      email: params.email,
      code: params.code,
      new_password: params.new_password,
      confirm_password: params.confirm_password,
      code_type: 'reset_password'
    });
  },

  /**
   * 更新当前登录用户信息
   * @param {Object} userData - 用户信息数据
   * @returns {Promise<Object>} - 更新结果
   */
  updateCurrentUser: (userData) => {
    return request.put('/api/user/update-info', userData);
  },

};

