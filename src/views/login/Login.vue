<template>
  <div class="login-container">
    
    <star-sky class="star-sky"></star-sky>
    <transition name="slide" mode="out-in">
      <template v-if="showLoginForm">
        <login-form key="login" @switch-to-register="handleSwitchToRegister" @switch-to-forgot-password="handleSwitchToForgotPassword"></login-form>
      </template>
      <template v-else-if="showRegisterForm">
        <register-form key="register" @switch-to-login="handleSwitchToLogin"></register-form>
      </template>
      <template v-else>
        <forget-password-form key="forgot-password" @switch-to-login="handleSwitchToLogin"></forget-password-form>
      </template>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import StarSky from '../../views/components/StarSky.vue'; // 背景组件
import LoginForm from './LoginForm.vue';
import RegisterForm from './RegisterForm.vue';
import ForgetPasswordForm from './ForgetPasswordForm.vue';

import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { userService } from '../../services/userService';

// 加载时检查登录状态
onMounted(async () => {
  const router = useRouter();
  try {
    const isLoggedIn = await userService.checkLoginStatus();
    if (isLoggedIn) {
      // 获取来源页面，如果没有则跳转到首页
      const redirect = router.currentRoute.value?.query.redirect || '/';
      ElMessage.success('您已登录，正在跳转到首页...');
      router.push(redirect);
    }
  } catch (error) {
    // console.error('检查登录状态失败:', error);
  }
});




// 控制显示哪个表单
const showLoginForm = ref(true);
const showRegisterForm = ref(false);
const showForgotPasswordForm = ref(false);

// 处理切换到注册表单的事件
const handleSwitchToRegister = () => {
  showLoginForm.value = false;
  showRegisterForm.value = true;
  showForgotPasswordForm.value = false;
};

// 处理切换回登录表单的事件
const handleSwitchToLogin = () => {
  showLoginForm.value = true;
  showRegisterForm.value = false;
  showForgotPasswordForm.value = false;
};

// 处理切换到忘记密码表单的事件
const handleSwitchToForgotPassword = () => {
  showLoginForm.value = false;
  showRegisterForm.value = false;
  showForgotPasswordForm.value = true;
};

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
  width: 100%;
  padding: 12px 15px;
  border: none;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 16px;
  box-sizing: border-box;
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

.register-account {
  text-align: left;
  margin-top: 15px;
  float: left;
}

.form-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 15px;
}

.remember-me {
  text-align: left;
  margin: 0;
}

.forgot-password {
  text-align: right;
  margin: 0;
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

/* 过渡动画样式 */
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

.login-form {
  /* 确保表单有固定宽度，以便动画正常工作 */
  width: 350px;
  /* 添加定位，使动画效果更平滑 */
  position: relative;
  z-index: 1;
}
</style>