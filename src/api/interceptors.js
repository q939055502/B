import { 
  getToken, 
  setToken, 
  getRefresh_token, 
  setRefresh_token, 
  removeToken, 
  removeRefresh_token 
} from '../utils/auth';
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
import { userAPI } from './userAPI';
import { handleError } from '../utils/error';
import { 
  HTTP_200_OK, 
  HTTP_401_UNAUTHORIZED, 
  errorMessages 
} from '../utils/status_codes';
import request from './index';

/**
 * 全局状态变量 - 是否正在刷新token
 * 用于防止并发刷新token请求
 */
let isRefreshing = false;

/**
 * 全局状态变量 - 请求队列
 * 存储等待刷新token后重试的请求
 */
let requestQueue = [];

/**
 * 常量 - 最大刷新尝试次数
 * 防止无限刷新token
 */
const MAX_REFRESH_ATTEMPTS = 3;

/**
 * 全局状态变量 - 当前刷新尝试次数
 * 跟踪已尝试的刷新次数
 */
let refreshAttempts = 0;























/**
 * 请求拦截器：发送请求前执行
 * @param {import('axios').AxiosRequestConfig} config - axios 请求配置对象
 * @returns {import('axios').AxiosRequestConfig} - 处理后的请求配置
 */
export const requestInterceptor = (config) => {
  // 确保 headers 是对象，避免后续赋值报错
  if (!config.headers) {
    config.headers = {};
  }

  // 检查是否是刷新令牌请求（包含特殊标记或URL包含/auth/refresh）
  const isRefreshRequest = config._isRefreshRequest || config.url.includes('/auth/refresh');
  const requestId = localStorage.getItem('requestId');
  
  // 根据请求类型获取对应的 token
  // 刷新请求使用refresh_token，其他请求使用access_token
  const token = isRefreshRequest ? getRefresh_token() : getToken();

  // 只有在 token 存在时才设置 Authorization 头
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // 从本地存储获取 requestId 并设置到请求头
  if (requestId) {
    config.headers['X-Request-Id'] = requestId;
  }

  // 打印请求参数（调试用）
  console.log('请求参数:', config.data);
  console.log('请求URL:', config.url);
  console.log('请求头:', config.headers['Authorization']);

  return config;
};














/**
 * 响应拦截器：成功收到响应后执行
 * @param {import('axios').AxiosResponse} response - axios 响应对象
 * @returns {Object} - 处理后的响应数据
 * @throws {Error} - 当业务请求失败时抛出错误
 */
export const responseSuccessInterceptor = async (response) => {
  let res = response;
  console.log('响应参数++--:', res);

  // 保存 requestId 到本地存储
  if (res.data.requestId) localStorage.setItem('requestId', res.data.requestId);
  
  // 处理响应中的令牌（如果有）
  if (res.data.access_token || res.data.refresh_token) {    
    // 更新本地存储中的令牌
    setToken({access_token: res.data.access_token,refresh_token: res.data.refresh_token});
    // 同时更新userStore中的令牌状态
    const useStore = await getUseUserStore();
    const userStore = useStore();
    userStore.access_token = res.data.access_token;
    userStore.refresh_token = res.data.refresh_token;
  }

  // 如果响应数据是字符串，且 Content-Type 是 application/json，尝试解析为 JSON 对象
  if (typeof res.data === 'string') {
    const contentType = res.headers?.['content-type'] || '';
    if (contentType.includes('application/json')) {
      try {
        res.data = JSON.parse(res.data);
      } catch (error) {
        console.error('Failed to parse JSON response:', error);
        // 解析失败，抛出错误
        const jsonError = new Error('Invalid JSON response from server');
        jsonError.code = 'INVALID_JSON_RESPONSE';
        throw jsonError;
      }
    } else {
      // 非 JSON 响应，记录并抛出错误
      console.error('Non-JSON response received:', res.data);
      const contentTypeError = new Error(`Unexpected response format: ${contentType}`);
      contentTypeError.code = 'UNEXPECTED_RESPONSE_FORMAT';
      throw contentTypeError;
    }
  }
  return res;
};





















/**
 * 响应拦截器：请求失败时执行（如网络错误、404、500）
 * @param {import('axios').AxiosError} error - 错误对象
 * @returns {Promise<any>} - 包含错误信息的 Promise
 */
export const responseErrorInterceptor = (error) => {
  // 处理 401 错误（未授权或 token 过期）
  if (error.response && error.response.status === HTTP_401_UNAUTHORIZED) {
    const originalRequest = error.config;
    const refreshToken = getRefresh_token();
    
    // 如果没有 refreshToken，直接执行错误处理
    if (!refreshToken) {
      handleError(error, true);
      return Promise.reject(error);
    }
    
    // 如果正在刷新 token，将请求加入队列等待重试
    if (isRefreshing) {
      return new Promise((resolve) => {
        requestQueue.push((token) => {
          // 创建新的请求头对象，防止原始请求头不可变
          originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${token}` };
          resolve(request(originalRequest));
        });
      });
    }

    // 检查是否超过最大刷新尝试次数
    if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
      console.error('超过最大刷新尝试次数，放弃刷新');
      removeToken();
      removeRefresh_token();
      userAPI.logout({});
      const maxAttemptsError = new Error('超过最大令牌刷新尝试次数');
      maxAttemptsError.code = 'MAX_REFRESH_ATTEMPTS_EXCEEDED';
      handleError(maxAttemptsError, true);
      return Promise.reject(maxAttemptsError);
    }

    // 标记正在刷新 token
    isRefreshing = true;
    // 增加刷新尝试次数
    refreshAttempts++;

    // 尝试刷新 token，添加超时处理
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        isRefreshing = false;
        console.error('刷新令牌超时：后端处理时间超过 10 秒');
        const timeoutError = new Error('刷新令牌超时');
        timeoutError.code = 'TOKEN_REFRESH_TIMEOUT';
        handleError(timeoutError, true);
        reject(timeoutError);
      }, 10000);

      // URL已包含/auth/refresh，拦截器会自动识别为刷新请求
      userAPI.refreshToken()
        .then((res) => {
          clearTimeout(timeoutId);
          const { access_token, refresh_token } = res.data;

          // 更新 access_token 和 refresh_token
          setToken({access_token,refresh_token});

          // 更新请求头中的 access_token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;

          // 重置刷新尝试次数
          refreshAttempts = 0;
          
          // 执行队列中的所有请求，传入新的access_token
          requestQueue.forEach(cb => cb(access_token));
          requestQueue = [];

          // 重试当前请求
          resolve(request(originalRequest));
        })
        .catch((err) => {
          // 刷新 token 失败，清除所有 token 
          removeToken();
          removeRefresh_token();
          userAPI.logout({});
          handleError(err, true);
          reject(err);
        })
        .finally(() => {
          // 重置刷新状态
          isRefreshing = false;
        });
    });
  }

  // 统一处理其他错误
  handleError(error);

  // 把错误抛出去，让组件能捕获
  return Promise.reject(error);
};