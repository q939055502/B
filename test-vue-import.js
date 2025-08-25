// 测试Vue导入
import { createApp } from 'vue';

console.log('Vue导入成功:', createApp !== undefined);

// 创建一个简单的Vue应用
const app = createApp({
  template: '<div>测试成功!</div>'
});

console.log('应用创建成功:', app !== undefined);