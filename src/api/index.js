/**
 * API 请求实例配置
 * @description 创建并配置全局 axios 实例，应用请求和响应拦截器
 */
import axios from 'axios';
import {
  requestInterceptor,
  responseSuccessInterceptor,
  responseErrorInterceptor
} from './interceptors';

/**
 * 创建定制化的 axios 实例
 * @type {import('axios').AxiosInstance}
 */
const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // API基础地址（从环境变量获取）
  timeout: 10000, // 超时时间（10秒）
  headers: {
    'Content-Type': 'application/json' // 默认请求头
  }
});

// 应用请求拦截器
request.interceptors.request.use(requestInterceptor);

// 应用响应拦截器
request.interceptors.response.use(
  responseSuccessInterceptor,
  responseErrorInterceptor // 启用错误拦截器
);

// 导出请求实例
 export default request;
