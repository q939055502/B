<template>
  <div class="login-container">
    <!-- <star-sky class="star-sky"></star-sky> -->


    <form class="login-form" @submit.prevent="handleLogin">
      <h2 class="form-title">报告管理系统</h2>
      <div class="form-group">
        <label class="input-label">用户名</label>
        <input type="text" v-model="username" placeholder="请输入用户名/邮箱" class="form-input"  />
      </div>
      <div class="form-group">
        <label class="input-label">密&#12288;码</label>
        <input type="password" v-model="password" placeholder="请输入密码" class="form-input" />
      </div>
      <div class="form-group">
          <el-checkbox v-model="rememberMe" class="remember-me-text">记住我</el-checkbox>
          <a href="#" @click.prevent="handleForgotPassword" class="forgot-password">忘记密码?</a>

      </div>
      <button type="submit" class="login-btn">登录</button>
      <button type="button" class="login-btn register-btn" @click="handleRegister">注册账号</button>
      
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue';
const emit = defineEmits(['switch-to-register', 'switch-to-forgot-password']);
import { userService } from '../../services/userService';
import { ElMessage } from 'element-plus'; 
// Element Plus组件由unplugin-vue-components插件自动导入

// 定义响应式变量
const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const loginForm = ref({});

// 读取记住的用户名
const rememberedUsername = localStorage.getItem('rememberedUsername');


// 初始化：读取记住的用户名
onMounted(() => {
  if (rememberedUsername) {
    username.value = rememberedUsername;
    rememberMe.value = true;
  }
});

// 处理登录
const handleLogin = async () => {
  try {
    // 准备登录表单数据
    const loginForm = {
      username: username.value,
      password: password.value,
      rememberMe: rememberMe.value
    };

    // 调用service层处理登录
    const loginSuccess = await userService.handleLogin(loginForm);
    if (!loginSuccess) {
      password.value = ''; // 清空密码
    }
  } catch (error) {
    console.error('登录异常', error);
    console.log('错误详情:', error.response || error.message);
    ElMessage.error('登录异常，请稍后重试: ' + (error.message || '未知错误'));
    password.value = ''; // 清空密码
  }
};

// 处理忘记密码
const handleForgotPassword = () => {
  // 发出切换到忘记密码表单的事件
  emit('switch-to-forgot-password');
};

// 处理注册账号
const handleRegister = () => {
  // 发出切换到注册表单的事件
  emit('switch-to-register');
};

// 导出函数供模板使用
defineExpose({
  handleLogin,
  handleForgotPassword,
  handleRegister
});
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}



/* 确保页面整体不出现滚动条 */
html, body {
  overflow: hidden;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden !important; /* 强制隐藏滚动条 */
  position: fixed; /* 防止移动端滚动 */
  overflow: hidden; /* 容器内溢出隐藏 */
}



.star-sky {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden !important; /* 强制隐藏滚动条 */
  position: fixed; /* 防止移动端滚动 */
  overflow: hidden; /* 容器内溢出隐藏 */
}

.login-form {
  width: 350px;
  padding: 30px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  color: white;
}

.form-title {
  text-align: center;
  margin-bottom: 25px;
  font-size: 22px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
}

.form-input {
  width: 80%;
  padding: 12px 15px;
  border: none;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 16px;
  box-sizing: border-box;
  margin-top: 5px;
  margin-left: auto;
}

.input-label {
  color: white;
  font-size: 14px;
  font-weight: 500;
  display: block;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #2563eb;
}

.register-btn {
  margin-top: 15px;
  background-color: rgba(59, 130, 246, 0.7);
}

.register-btn:hover {
  background-color: rgba(37, 99, 235, 0.9);
}

.register-account {
  text-align: left;
  margin-top: 15px;
  float: left;
}

.form-group {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 改为左对齐 */
  margin-top: 15px;
}

.remember-me {
  text-align: left;
  margin: 0;
  margin-right: 5px; /* 减小右边距 */
}

  .remember-me-text {
    color: white; /* 改为白色以便在深色背景上更明显 */
    font-size: 14px;
    vertical-align: middle;
    margin-right: 15px; /* 增加与忘记密码链接的间距 */
  }

  .forgot-password {
  text-align: right;
  margin: 0;
  margin-left: auto; /* 让忘记密码链接靠右 */
}

.forgot-password a {
  color: white;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.forgot-password a:hover {
  color: white;
  text-decoration: underline;
}

body {
  margin: 0;
  padding: 0;
}

</style>