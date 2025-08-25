<template>
  <div class="login-container">
    <star-sky class="star-sky"></star-sky>

    <form class="login-form" @submit.prevent="resetPasswordByCode">
      <h2 class="form-title">建设工程检查报告管理系统</h2>
      <div class="form-group">
        <label class="input-label">邮&ensp;&ensp;&ensp;&ensp;箱</label>
        <input type="email" v-model="email" placeholder="请输入邮箱" class="form-input" />
      </div>
      <div class="form-group verification-group">
        <label class="input-label verification-label">验&ensp;证&ensp;码</label>
        <input type="text" v-model="verificationCode" placeholder="请输入验证码" class="form-input verification-input" />
        <button type="button" @click="sendVerificationCode" :disabled="sendingCode" class="send-code-btn">{{ sendingCode ? '发送中...' : sendingCode || countdown > 0 ? `${countdown}秒后重新发送` : '发送验证码' }}</button>
      </div>
      <div class="form-group">
        <label class="input-label">新&ensp;密&ensp;码</label>
        <input type="password" v-model="newPassword" placeholder="请输入新密码" class="form-input" />
      </div>
      <div class="form-group">
        <label class="input-label">确认密码</label>
        <input type="password" v-model="confirmPassword" placeholder="请确认新密码" class="form-input" />
      </div>
      <button type="submit" class="login-btn" :disabled="sendingReset">{{ sendingReset ? '重置中...' : '重置密码' }}</button>
      <div class="return-login">
        <a href="#" @click.prevent="handleReturnLogin">返回登录</a>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';
const emit = defineEmits(['switch-to-login']);
import { ElMessage } from 'element-plus';
import { User, Lock, Key } from '@element-plus/icons-vue';
import StarSky from '../../views/components/StarSky.vue';
import { userService } from '../../services/userService';

// 定义响应式变量
const email = ref('');
const verificationCode = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const sendingCode = ref(false);
const countdown = ref(0);
const sendingReset = ref(false);

// 发送验证码
const sendVerificationCode = async () => {
  if (!email.value.trim() || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.value)) {
    ElMessage.error('请输入有效的邮箱地址');
    return;
  }

  if (countdown.value > 0) {
    return;
  }

  sendingCode.value = true;

  try {
    // 调用发送重置验证码服务
    const result = await userService.sendResetCode(email.value);

    if (result) {
      countdown.value = 60;
      // 倒计时
      const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    }
  } catch (error) {
    console.error('发送重置验证码异常', error);
  } finally {
    sendingCode.value = false;
  }
};

// 重置密码
const resetPasswordByCode = async () => {
  try {
    // 表单验证
    if (!email.value.trim() || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.value)) {
      ElMessage.error('请输入有效的邮箱地址');
      return;
    }

    if (!verificationCode.value.trim()) {
      ElMessage.error('请输入验证码');
      return;
    }

    if (!newPassword.value.trim() || newPassword.value.length < 6) {
      ElMessage.error('新密码长度不能少于6位');
      return;
    }

    if (newPassword.value !== confirmPassword.value) {
      ElMessage.error('两次输入的密码不一致');
      return;
    }

    sendingReset.value = true;

    // 调用重置密码服务
    const result = await userService.resetPasswordByCode(
      email.value,
      verificationCode.value,
      newPassword.value,
      confirmPassword.value
    );

    if (result) {
      // 重置表单并返回登录
      email.value = '';
      verificationCode.value = '';
      newPassword.value = '';
      confirmPassword.value = '';
      countdown.value = 0;

      // 延迟返回登录页
      setTimeout(() => {
        handleReturnLogin();
      }, 1500);
    }
  } catch (error) {
    console.error('重置密码异常', error);
    ElMessage.error('重置密码异常，请稍后重试');
  } finally {
    sendingReset.value = false;
  }
};

// 返回登录
const handleReturnLogin = () => {
  // 发出切换到登录表单的事件
  emit('switch-to-login');
};

// 导出函数供模板使用
defineExpose({
  resetPasswordByCode,
  sendVerificationCode,
  handleReturnLogin
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
  background: transparent;
}

.star-sky {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.login-form {
  width: 350px;
  padding: 30px;
  background-color: transparent;
  backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  color: white;
  z-index: 1;
}

.form-title {
  text-align: center;
  margin-bottom: 25px;
  font-size: 22px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
  position: relative;
  display: flex;
  align-items: center;
}

.verification-group {
  display: flex;
  gap: 10px;
}

.send-code-btn {
  width:23%;
  height:40px;
  padding: 0 0px;
  background-color: #4c6ef5;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  text-align: center;
  margin-right: 0;
}

.send-code-btn:disabled {
  background-color: #495057;
  cursor: not-allowed;
}

.form-input {
  width: calc(100% - 90px);
  padding: 12px 15px;
  border: none;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 16px;
  box-sizing: border-box;
  margin-top: 0;
  margin-left: 0;
  margin-right: 0;
  display: block;
  text-align: left;
}



.input-label {
  width: 80px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  margin-right: 10px;
  margin-right:right;
}
.verification-input {
  width: 48%;
  flex: none;
}
.verification-label {
  display: block;
  margin-bottom: 5px;
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
  margin-bottom: 15px;
}

.login-btn:hover {
  background-color: #2563eb;
}

.return-login {
  text-align: center;
  margin-top: 15px;
}

.return-login a {
  color: white;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.return-login a:hover {
  color: #3b82f6;
  text-decoration: underline;
}

body {
  margin: 0;
  padding: 0;
}

/* 确保页面整体不出现滚动条 */
html, body {
  overflow: hidden;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  position: fixed;
}

/* 已移除标题Logo图片 */

/* 验证码标签特殊样式 */
.verification-group .input-label {
  flex: 1;
}
</style>