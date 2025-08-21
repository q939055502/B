// // 调试initUserStore未定义错误
// console.log('查找initUserStore调用...');

// // 监听全局函数调用
// const originalCall = Function.prototype.call;
// Function.prototype.call = function(context) {
//   if (this.name === 'initUserStore' || arguments[0] === 'initUserStore') {
//     console.error('检测到initUserStore调用:', this, arguments);
//     console.trace('调用栈:');
//   }
//   return originalCall.apply(this, arguments);
// };

// // 检查window对象
// if (window.initUserStore) {
//   console.log('window.initUserStore存在:', window.initUserStore);
// } else {
//   console.log('window.initUserStore不存在');
//   // 添加临时实现以避免错误
//   window.initUserStore = function() {
//     console.warn('临时实现的initUserStore被调用');
//     return window.app?.config?.globalProperties?.$pinia?.useUserStore()?.initUser?.apply(this, arguments);
//   };
// }