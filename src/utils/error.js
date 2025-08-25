import { ElMessage } from 'element-plus'; // 假设用 element-plus 的提示组件
import { removeToken, removeRefresh_token } from './auth';
import router from '../router'; // 路由实例
import { HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN, HTTP_404_NOT_FOUND, HTTP_500_INTERNAL_SERVER_ERROR, errorMessages } from './status_codes';

// 统一错误处理函数
/**
 * @param {Object} error - 错误对象
 * @param {boolean} isRefreshError - 是否是刷新token失败导致的错误
 */
export const handleError = (error, isRefreshError = false) => {
  // 1. 网络错误（没网）
  if (!error.response) {
    ElMessage.error('网络异常，请检查网络连接');
    return;
  }

  // 2. 根据HTTP状态码处理
  const status = error.response.status;
  switch (status) {
    case HTTP_401_UNAUTHORIZED:
      // 401：未登录或 access_token 过期
// 只有刷新token失败时才清除access_token和跳转登录页
  if (isRefreshError) {
    ElMessage.error('登录已过期，请重新登录');
    removeToken(); // 清除无效 access_token
        removeRefresh_token(); // 清除无效 refresh_token
        router.push('/login'); // 跳登录页
      }
      break;
    case HTTP_403_FORBIDDEN:
      // 403：没有权限
      ElMessage.error('没有权限访问');
      break;
    case HTTP_404_NOT_FOUND:
      // 404：接口不存在
      ElMessage.error('请求的资源不存在');
      break;
    case HTTP_500_INTERNAL_SERVER_ERROR:
      // 500：后端服务器错误
      ElMessage.error('服务器内部错误，请稍后再试');
      break;
    default:
      // 3. 处理业务状态码（1000~1999）
      const resData = error.response.data;
      if (resData && resData.code && resData.code >= 1000 && resData.code < 2000) {
        const errorMsg = errorMessages[resData.code] || resData.message || '业务处理失败';
        ElMessage.error(errorMsg);
      } else {
        // 其他错误
        const errorMsg = resData?.message || '请求失败';
        ElMessage.error(errorMsg);
      }
  }
};
