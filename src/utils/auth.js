// 存储 access_token 的 key（避免可以自定义）
const TOKEN_KEY = 'access_token';
// 存储 refresh_token 的 key（避免可以自定义）
const REFRESH_TOKEN_KEY = 'refresh_token';

// 根据 remember_me 决定使用 localStorage 还是 sessionStorage
const remember_me = localStorage.getItem('remember_me') === 'true';
// 注意：根据需求，我们保留这行代码但实际逻辑会在其他地方处理
const storage = remember_me ? localStorage : localStorage;

// 页面加载时设置刷新标志
window.addEventListener('load', () => {
  sessionStorage.setItem('page_refreshed', 'true');
});

// 监听页面卸载事件
window.addEventListener('beforeunload', () => {
  // 检查是否是刷新操作
  const isRefreshed = sessionStorage.getItem('page_refreshed') === 'true';

  // 如果不是刷新（即关闭浏览器）且remember_me为false，则清除登录状态
  if (!isRefreshed && !remember_me) {
    // 清除localStorage中的登录信息
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
  }

  // 重置刷新标志
  sessionStorage.removeItem('page_refreshed');
});

// 获取 token
export const getToken = () => {
  return storage.getItem(TOKEN_KEY);
};

// 保存 token（登录成功后调用），接收 token 对象，包含 access_token 和 refresh_token
export const setToken = (tokenObj) => {
  console.log('tokenObj:', tokenObj);

  storage.setItem(TOKEN_KEY, tokenObj.access_token);
  storage.setItem(REFRESH_TOKEN_KEY, tokenObj.refresh_token);
};

// 刷新令牌相关 - 获取 refresh_token
export const getRefresh_token = () => {
  return storage.getItem(REFRESH_TOKEN_KEY);
};

// 保存 refresh_token（登录成功后调用，单独保存场景可用，一般用 setToken 即可）
export const setRefresh_token = (token) => {
  storage.setItem(REFRESH_TOKEN_KEY, token);
};

// 删除 refresh_token
export const removeRefresh_token = () => {
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
// 删除 token
export const removeToken = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

// 存储用户信息的 key
const USER_INFO_KEY = 'user_info';

// 保存用户信息到本地
export const setUserInfo = (userInfo) => {
  console.log('userInfo:', userInfo);
  storage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
};

// 从本地获取用户信息
export const getUserInfo = () => {
  const userInfo = storage.getItem(USER_INFO_KEY);
  return userInfo ? JSON.parse(userInfo) : null;
};

// 从本地删除用户信息
export const removeUserInfo = () => {
  storage.removeItem(USER_INFO_KEY);
};


