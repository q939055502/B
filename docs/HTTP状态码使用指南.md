# HTTP状态码使用指南

## 目的
为了规范项目中HTTP状态码的使用，提高代码一致性和可维护性，我们创建了集中管理的状态码常量定义。本指南说明如何正确使用这些常量。

## 状态码常量定义位置
所有HTTP状态码常量定义在 `app/utils/status_codes.py` 文件中，包括：
- 标准HTTP状态码（如200, 400, 401, 404, 500等）
- 自定义业务状态码（1000~1999）
- 错误消息映射字典

## 状态码常量详细列表
以下是项目中使用的所有状态码常量，按类别划分：

### 成功状态码
| 常量名称 | 数值 | 描述 |
|---------|------|------|
| HTTP_200_OK | 200 | 请求成功 |
| HTTP_201_CREATED | 201 | 创建成功 |
| HTTP_202_ACCEPTED | 202 | 请求已接受 |
| HTTP_204_NO_CONTENT | 204 | 无内容 |

### 重定向状态码
| 常量名称 | 数值 | 描述 |
|---------|------|------|
| HTTP_301_MOVED_PERMANENTLY | 301 | 永久移动 |
| HTTP_302_FOUND | 302 | 临时移动 |
| HTTP_304_NOT_MODIFIED | 304 | 未修改 |

### 客户端错误状态码
| 常量名称 | 数值 | 描述 |
|---------|------|------|
| HTTP_400_BAD_REQUEST | 400 | 请求参数错误 |
| HTTP_401_UNAUTHORIZED | 401 | 未授权 |
| HTTP_403_FORBIDDEN | 403 | 禁止访问 |
| HTTP_404_NOT_FOUND | 404 | 资源不存在 |
| HTTP_405_METHOD_NOT_ALLOWED | 405 | 方法不允许 |
| HTTP_406_NOT_ACCEPTABLE | 406 | 不可接受 |
| HTTP_408_REQUEST_TIMEOUT | 408 | 请求超时 |
| HTTP_409_CONFLICT | 409 | 冲突 |
| HTTP_410_GONE | 410 | 资源已删除 |
| HTTP_413_REQUEST_ENTITY_TOO_LARGE | 413 | 请求实体过大 |
| HTTP_414_REQUEST_URI_TOO_LONG | 414 | 请求URI过长 |
| HTTP_415_UNSUPPORTED_MEDIA_TYPE | 415 | 不支持的媒体类型 |
| HTTP_422_UNPROCESSABLE_ENTITY | 422 | 无法处理的实体 |
| HTTP_429_TOO_MANY_REQUESTS | 429 | 请求过多 |

### 服务器错误状态码
| 常量名称 | 数值 | 描述 |
|---------|------|------|
| HTTP_500_INTERNAL_SERVER_ERROR | 500 | 服务器内部错误 |
| HTTP_501_NOT_IMPLEMENTED | 501 | 未实现 |
| HTTP_502_BAD_GATEWAY | 502 | 网关错误 |
| HTTP_503_SERVICE_UNAVAILABLE | 503 | 服务不可用 |
| HTTP_504_GATEWAY_TIMEOUT | 504 | 网关超时 |
| HTTP_505_HTTP_VERSION_NOT_SUPPORTED | 505 | HTTP版本不支持 |

### 业务状态码
| 常量名称 | 数值 | 描述 |
|---------|------|------|
| BUSINESS_ERROR | 1000 | 业务错误 |
| DATA_VALIDATION_ERROR | 1001 | 数据验证错误 |
| AUTHENTICATION_ERROR | 1002 | 认证错误 |
| AUTHORIZATION_ERROR | 1003 | 授权错误 |
| RESOURCE_NOT_FOUND | 1004 | 资源不存在 |
| DUPLICATE_RESOURCE | 1005 | 资源重复 |
| PERMISSION_DENIED | 1006 | 权限不足 |
| SERVICE_UNAVAILABLE | 1007 | 服务不可用 |
| RATE_LIMIT_EXCEEDED | 1008 | 超出限流 |

## 使用方法

### 1. 导入状态码常量
在需要使用状态码的文件中，导入所需的常量：

```python
from app.utils.status_codes import (
    HTTP_200_OK,          # 请求成功
    HTTP_400_BAD_REQUEST, # 请求参数错误
    HTTP_401_UNAUTHORIZED,# 未授权
    HTTP_404_NOT_FOUND,   # 资源不存在
    HTTP_500_INTERNAL_SERVER_ERROR # 服务器内部错误
)
```

### 2. 在API响应中使用
使用 `api_response` 函数时，指定状态码常量：

```python
from app.utils.response import api_response
from app.utils.status_codes import HTTP_200_OK, HTTP_404_NOT_FOUND

# 成功响应
return api_response(
    success=True,
    code=HTTP_200_OK,
    message="操作成功",
    data=result
)

# 错误响应
return api_response(
    success=False,
    code=HTTP_404_NOT_FOUND,
    message="请求的资源不存在"
)
```

### 3. 在错误处理器中使用
定义错误处理器时，使用状态码常量：

```python
from flask import app
from app.utils.status_codes import HTTP_400_BAD_REQUEST

@app.errorhandler(HTTP_400_BAD_REQUEST)
def bad_request(error):
    return jsonify({
        "success": False,
        "code": HTTP_400_BAD_REQUEST,
        "message": "请求参数错误"
    }), HTTP_400_BAD_REQUEST
```

## 新增状态码
如果需要添加新的HTTP状态码或自定义业务状态码：

1. 在 `app/utils/status_codes.py` 文件中添加新常量
2. 如果是通用错误，同时在 `error_messages` 字典中添加对应的错误消息
3. 更新本指南（可选）

## 注意事项
1. 始终使用常量而非硬编码数字，以提高代码可读性和可维护性
2. 对于HTTP标准状态码，使用前缀 `HTTP_` 后跟状态码和描述
3. 对于自定义业务状态码（1000~1999），使用描述性名称
4. 确保错误消息与状态码含义一致
5. 在添加新状态码前，检查是否已有合适的状态码可用

## 示例

### 正确用法
```python
from app.utils.status_codes import HTTP_200_OK, HTTP_400_BAD_REQUEST

# 成功响应
return api_response(code=HTTP_200_OK, message="成功", data=result)

# 错误响应
return api_response(success=False, code=HTTP_400_BAD_REQUEST, message="参数错误")
```

### 错误用法
```python
# 不推荐：直接使用数字
return api_response(code=200, message="成功")

# 不推荐：混合使用数字和常量
return jsonify({"code": 400}), HTTP_400_BAD_REQUEST
```