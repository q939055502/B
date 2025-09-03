import { ref } from 'vue';
import { defineStore } from 'pinia';
// 导入userService的单例获取函数
import { getuserService } from '../services/userService';
import { getToken, setToken, removeToken, getRefresh_token, setRefresh_token, removeRefresh_token } from '../utils/auth';

export const useUserStore = defineStore('user', () => {
  // 状态定义
  const user = ref(null); // 用户详细信息（如姓名、头像），包含permissions属性
  const remember_me=ref(false);
  const access_token = ref('');
  const refresh_token = ref('');

  // 设置用户信息
  const setUser = (userData) => {
    user.value = userData || null; // 确保user始终是一个有效值
    // permissions现在存储在user对象内部
  };


  // 获取用户信息：调用service层处理获取用户信息业务逻辑
  const getUser = async () => {
    return await getuserService().handleGetUser();
  };

  // 初始化用户（由外部和service调用）
  const initUser = async () => {
    try {
      const storedRememberMe = localStorage.getItem('remember_me');
      remember_me.value = storedRememberMe === 'true';
      
      // 如果remember_me为true，从localStorage获取token否则从sessionStorage
      // 使用auth.js中统一的方法获取token
      const storedToken = getToken();
      const storedRefreshToken = getRefresh_token();
      
      if (storedToken) {
          access_token.value = storedToken;
          refresh_token.value = storedRefreshToken;
          const userData = await getUser();
          // 获取用户信息后，更新userstore
          setUser(userData);
        } else {
        // 当token不存在时，确保清除状态
        access_token.value = '';
        refresh_token.value = '';
        user.value = null;
      }
    } catch (error) {
      console.error('初始化用户失败:', error);
      // 初始化失败时清除access_token
      access_token.value = '';
      refresh_token.value = '';
      user.value = null;
      removeToken();
      removeRefresh_token();
    }
  };

  // 返回需要暴露的属性和方法
  return {
    user,
    access_token,
    refresh_token,
    remember_me,

    setUser,
    getUser,
    initUser,
  };
});
    