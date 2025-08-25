<template>
  <div class="login-container">
    <star-sky class="star-sky"></star-sky>

    <form class="login-form" @submit.prevent="handleRegister">
      <h2 class="form-title">建设工程检查报告管理系统</h2>
      <div class="form-group">
        <label class="input-label">用&ensp;户&ensp;名</label>
        <input type="text" v-model="username" placeholder="请输入用户名" class="form-input" />      
      </div>
      <div class="form-group">
        <label class="input-label">昵&ensp;&ensp;&ensp;&ensp;称</label>
        <input type="text" v-model="nickname" placeholder="请输入昵称" class="form-input" />      
      </div>
      <div class="form-group">
        <label class="input-label">邮&ensp;&ensp;&ensp;&ensp;箱</label>
        <input type="email" v-model="email" placeholder="请输入邮箱" class="form-input" />      
      </div>
      <div class="form-group">
        <label class="input-label">密&ensp;&ensp;&ensp;&ensp;码</label>
        <input type="password" v-model="password" placeholder="请输入密码" class="form-input" />
      </div>
      <div class="form-group">
        <label class="input-label">确认密码</label>
        <input type="password" v-model="confirmPassword" placeholder="请确认密码" class="form-input" />
      </div>
      <div class="form-group verification-group">
        <label class="input-label verification-label">验&ensp;证&ensp;码</label>
        <input type="text" v-model="verificationCode" placeholder="请输入验证码" class="form-input verification-input" />
        <button type="button" @click="sendVerificationCode" :disabled="sendingCode" class="send-code-btn">{{ sendingCode ? '发送中...' : '发送验证码' }}</button>
      </div>
      <button type="submit" class="login-btn">注册</button>
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
import { useRouter } from 'vue-router';
const router = useRouter();
// 导入用户服务
import { userService } from '../../services/userService';

// 定义响应式变量
const username = ref('');
const nickname = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const verificationCode = ref('');
const sendingCode = ref(false);
const countdown = ref(0);

// 处理注册
const handleRegister = async () => {
  try {
    // 表单验证
    if (!username.value.trim()) {
      ElMessage.error('请输入用户名');
      return;
    }

    if (!nickname.value.trim()) {
      ElMessage.error('请输入昵称');
      return;
    }

    if (!email.value.trim() || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.value)) {
      ElMessage.error('请输入有效的邮箱地址');
      return;
    }

    if (!password.value || password.value.length < 6) {
      ElMessage.error('密码长度不能少于6位');
      return;
    }

    if (password.value !== confirmPassword.value) {
      ElMessage.error('两次输入的密码不一致');
      return;
    }

    if (!verificationCode.value.trim()) {
      ElMessage.error('请输入验证码');
      return;
    }

    // 准备注册表单数据
    const registerForm = {
      username: username.value,
      nickname: nickname.value,
      email: email.value,
      password: password.value,
      email_code: verificationCode.value
    };

    // 调用服务层注册方法
    const success = await userService.register(registerForm);
    if (success) {
      handleReturnLogin();
    }
  } catch (error) {
    console.error('注册异常', error);
    ElMessage.error('注册异常，请稍后重试: ' + (error.message || '未知错误'));
  }
};

// 发送验证码
const sendVerificationCode = async () => {
  if (!email.value.trim() || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.value)) {
    ElMessage.error('请输入有效的邮箱地址');
    return;
  }

  sendingCode.value = true;
  countdown.value = 60;

  try {
    // 调用服务层发送验证码方法
    const success = await userService.sendRegisterCode(email.value);
    if (success) {
      sendingCode.value = false;

      // 倒计时
      const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    } else {
      sendingCode.value = false;
    }
  } catch (error) {
    console.error('发送验证码异常', error);
    ElMessage.error('发送验证码异常，请稍后重试: ' + (error.message || '未知错误'));
    sendingCode.value = false;
  }
};

// 返回登录
const handleReturnLogin = () => {
  // 发出切换到登录表单的事件
  emit('switch-to-login');
};

// 导出函数供模板使用
defineExpose({
  handleRegister,
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

.input-label {
  width: 20%;
  color: white;
  font-size: 14px;
  font-weight: 500;
  margin-left: 0px;
  text-align: right;
  box-sizing: border-box;
  flex: none;
}
.input-label.verification-label{
  
  width: 10%;
  color: white;
  font-size: 14px;
  font-weight: 500;
  margin-left: 5%;
  text-align: left;
  box-sizing: border-box;
  flex: none;
}
.verification-group {
  display: flex;
  gap: 10px;
}

.verification-input {
  flex: 1;
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
.form-input.verification-input{
  width: 45%;
  flex: none;
}


.form-input.verification-input:disabled {
  background-color: #495057;
  cursor: not-allowed;
}

.form-input {
  width: 70%;
  padding: 12px 15px;
  border: none;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 16px;
  box-sizing: border-box;
  margin-top: 5px;
  margin-right: 0px;
  margin-left: auto;
  display: block;
}

.input-label {
  width: 20%;
  color: white;
  font-size: 14px;
  font-weight: 500;
  margin-left: 0px;
  padding-top: 12px;
  display: block;
  text-align: right;
  box-sizing: border-box;
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