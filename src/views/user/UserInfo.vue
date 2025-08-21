<template>
  <div class="user-form-container">
    <div class="page-header">
      <h1>个人信息</h1>
    </div>

    <form class="user-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label class="form-label">用户名 <span class="required">*</span></label>
        <input
          type="text"
          v-model="userForm.username"
          placeholder="请输入用户名"
          class="form-input"
          disabled
        />
      </div>

      <div class="form-group">
        <label class="form-label">邮箱 <span class="required">*</span></label>
        <input
          type="email"
          v-model="userForm.email"
          placeholder="请输入邮箱"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label class="form-label">昵称</label>
        <input
          type="text"
          v-model="userForm.nickname"
          placeholder="请输入昵称"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label class="form-label">头像URL</label>
        <input
          type="text"
          v-model="userForm.avatar"
          placeholder="请输入头像URL"
          class="form-input"
        />
      </div>

      <div class="form-actions">
        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? '提交中...' : '保存' }}
        </button>
        <button type="button" @click="handleCancel" class="cancel-btn">取消</button>
      </div>
    </form>
  </div>
</template>

<script setup>
// 新增：导入 defineEmits
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/userStore';
import { userService } from '../../services/userService';
// import { permissionService } from '../../services/permissionService';

// 响应式变量
const userStore = useUserStore();
const userForm = ref({
  username: '',
  email: '',
  nickname: '',
  avatar: ''
});
const isSubmitting = ref(false);
const router = useRouter();

// 加载当前登录用户信息
const loadCurrentUserInfo = async () => {
  try {
    // 从userStore获取用户信息
    if (userStore.user) {
      const user = userStore.user;
      userForm.value = {
        username: user.username || '',
        email: user.email || '',
        nickname: user.nickname || '',
        avatar: user.avatar || ''
      };
    } else {
      // 如果userStore中没有用户信息，尝试从服务器获取
      await userService.handleGetUser();
      if (userStore.user) {
        const user = userStore.user;
        userForm.value = {
          username: user.username || '',
          email: user.email || '',
          nickname: user.nickname || '',
          avatar: user.avatar || ''
        };
      } else {
        ElMessage.error('未找到用户信息');
        router.push('/login');
      }
    }
  } catch (error) {
    console.error('加载用户信息失败:', error);
    ElMessage.error('加载用户信息失败: ' + (error.message || '未知错误'));
    router.push('/login');
  }
};

// 表单验证
const validateForm = () => {
  if (!userForm.value.username.trim()) {
    ElMessage.error('请输入用户名');
    return false;
  }

  if (!userForm.value.email.trim() || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userForm.value.email)) {
    ElMessage.error('请输入有效的邮箱地址');
    return false;
  }

  return true;
};

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;
  try {
    const formData = {
      username: userForm.value.username,
      email: userForm.value.email,
      nickname: userForm.value.nickname,
      avatar: userForm.value.avatar
    };

    // 更新当前登录用户信息
    await userService.updateCurrentUser(formData);
    ElMessage.success('更新个人信息成功');

    // 更新userStore中的用户信息
    await userService.handleGetUser();

    // 刷新页面
    router.push('/user/info');
  } catch (error) {
    console.error('更新个人信息失败:', error);
    ElMessage.error('更新个人信息失败: ' + (error.message || '未知错误'));
  } finally {
    isSubmitting.value = false;
  }
};

// 取消操作
const handleCancel = () => {
  router.push('/home');
};

// 初始加载
onMounted(() => {
  loadCurrentUserInfo();
});
</script>

<style scoped>
.user-form-container {
  padding: 20px;
  color: #333;
}

.page-header {
  margin-bottom: 20px;
}

.user-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.required {
  color: #ef4444;
}

.form-input, .form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

.radio-group {
  display: flex;
  gap: 20px;
  margin-top: 8px;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}

.submit-btn, .cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.submit-btn {
  background-color: #3b82f6;
  color: white;
}

.cancel-btn {
  background-color: #d1d5db;
  color: #333;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>