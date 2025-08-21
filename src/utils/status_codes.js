/**
 * HTTP状态码常量定义
 * 与后端app/utils/status_codes.py保持一致
 */

// 成功状态码
export const HTTP_200_OK = 200; // 请求成功
export const HTTP_201_CREATED = 201; // 创建成功
export const HTTP_202_ACCEPTED = 202; // 请求已接受
export const HTTP_204_NO_CONTENT = 204; // 无内容

// 重定向状态码
export const HTTP_301_MOVED_PERMANENTLY = 301; // 永久移动
export const HTTP_302_FOUND = 302; // 临时移动
export const HTTP_304_NOT_MODIFIED = 304; // 未修改

// 客户端错误状态码
export const HTTP_400_BAD_REQUEST = 400; // 请求参数错误
export const HTTP_401_UNAUTHORIZED = 401; // 未授权
export const HTTP_403_FORBIDDEN = 403; // 禁止访问
export const HTTP_404_NOT_FOUND = 404; // 资源不存在
export const HTTP_405_METHOD_NOT_ALLOWED = 405; // 方法不允许
export const HTTP_406_NOT_ACCEPTABLE = 406; // 不可接受
export const HTTP_408_REQUEST_TIMEOUT = 408; // 请求超时
export const HTTP_409_CONFLICT = 409; // 冲突
export const HTTP_410_GONE = 410; // 资源已删除
export const HTTP_413_REQUEST_ENTITY_TOO_LARGE = 413; // 请求实体过大
export const HTTP_414_REQUEST_URI_TOO_LONG = 414; // 请求URI过长
export const HTTP_415_UNSUPPORTED_MEDIA_TYPE = 415; // 不支持的媒体类型
export const HTTP_422_UNPROCESSABLE_ENTITY = 422; // 无法处理的实体
export const HTTP_429_TOO_MANY_REQUESTS = 429; // 请求过多

// 服务器错误状态码
export const HTTP_500_INTERNAL_SERVER_ERROR = 500; // 服务器内部错误
export const HTTP_501_NOT_IMPLEMENTED = 501; // 未实现
export const HTTP_502_BAD_GATEWAY = 502; // 网关错误
export const HTTP_503_SERVICE_UNAVAILABLE = 503; // 服务不可用
export const HTTP_504_GATEWAY_TIMEOUT = 504; // 网关超时
export const HTTP_505_HTTP_VERSION_NOT_SUPPORTED = 505; // HTTP版本不支持

// 业务状态码
export const BUSINESS_ERROR = 1000; // 业务错误
export const DATA_VALIDATION_ERROR = 1001; // 数据验证错误
export const AUTHENTICATION_ERROR = 1002; // 认证错误
export const AUTHORIZATION_ERROR = 1003; // 授权错误
export const RESOURCE_NOT_FOUND = 1004; // 资源不存在
export const DUPLICATE_RESOURCE = 1005; // 资源重复
export const PERMISSION_DENIED = 1006; // 权限不足
export const SERVICE_UNAVAILABLE = 1007; // 服务不可用
export const RATE_LIMIT_EXCEEDED = 1008; // 超出限流

// 错误消息映射
export const errorMessages = {
  [HTTP_200_OK]: '请求成功',
  [HTTP_201_CREATED]: '创建成功',
  [HTTP_400_BAD_REQUEST]: '请求参数错误',
  [HTTP_401_UNAUTHORIZED]: '未授权',
  [HTTP_403_FORBIDDEN]: '禁止访问',
  [HTTP_404_NOT_FOUND]: '资源不存在',
  [HTTP_500_INTERNAL_SERVER_ERROR]: '服务器内部错误',
  [BUSINESS_ERROR]: '业务错误',
  [DATA_VALIDATION_ERROR]: '数据验证错误',
  [AUTHENTICATION_ERROR]: '认证错误',
  [AUTHORIZATION_ERROR]: '授权错误',
  [RESOURCE_NOT_FOUND]: '资源不存在',
  [PERMISSION_DENIED]: '权限不足'
};