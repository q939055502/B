// // src/utils/storage.js
// export const Storage = {
//   // localStorage 操作
//   setLocal(key, value) {
//     localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
//   },
//   getLocal(key) {
//     const value = localStorage.getItem(key);
//     try {
//       return JSON.parse(value); // 尝试解析JSON（支持对象存储）
//     } catch {
//       return value; // 非JSON格式直接返回
//     }
//   },
//   removeLocal(key) {
//     localStorage.removeItem(key);
//   },
  
//   // cookie 操作
//   setCookie(key, value, days = 7) {
//     const date = new Date();
//     date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
//     document.cookie = `${key}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/`;
//   },
//   getCookie(key) {
//     const cookies = document.cookie.split('; ');
//     for (const cookie of cookies) {
//       const [k, v] = cookie.split('=');
//       if (k === key) return decodeURIComponent(v);
//     }
//     return null;
//   }
// };

// // 组件初始化时获取数据（onMounted中）
// onMounted(() => {
//   const savedUsername = Storage.getLocal('rememberedUsername');
//   if (savedUsername) {
//     username.value = savedUsername;
//     rememberMe.value = true;
//   }
// });

