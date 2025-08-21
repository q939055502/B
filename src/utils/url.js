// src/utils/url.js
export const UrlUtils = {
  // 解析URL参数为对象（如 ?id=1&name=test → { id: '1', name: 'test' }）
  parseParams(url) {
    const params = {};
    const search = url.split('?')[1] || '';
    search.split('&').forEach(item => {
      const [key, value] = item.split('=');
      if (key) params[key] = decodeURIComponent(value);
    });
    return params;
  },
  
  // 拼接参数到URL
  stringifyParams(url, params) {
    const keys = Object.keys(params);
    if (keys.length === 0) return url;
    const search = keys.map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
    return `${url}?${search}`;
  }
};