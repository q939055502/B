<template>
  <div class="user-form-container">
    <div class="page-header">
      <h1>{{ isEditing ? '编辑人员' : '添加人员' }}</h1>
    </div>

    <form class="user-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label class="form-label">用户名 <span class="required">*</span></label>
        <input
          type="text"
          v-model="userForm.username"
          placeholder="请输入用户名"
          class="form-input"
          :disabled="isEditing"
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

      <div v-if="!isEditing" class="form-group">
        <label class="form-label">密码 <span class="required">*</span></label>
        <input
          type="password"
          v-model="userForm.password"
          placeholder="请输入密码"
          class="form-input"
        />
      </div>

      <div v-if="!isEditing" class="form-group">
        <label class="form-label">确认密码 <span class="required">*</span></label>
        <input
          type="password"
          v-model="userForm.confirmPassword"
          placeholder="请确认密码"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label class="form-label">角色 <span class="required">*</span></label>
        <select v-model="userForm.roleId" class="form-select">
          <option value="">请选择角色</option>
          <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">状态</label>
        <div class="radio-group">
          <label>
            <input
              type="radio"
              value=1
              v-model="userForm.status"
            />
            启用
          </label>
          <label>
            <input
              type="radio"
              value=2
              v-model="userForm.status"
            />
            禁用
          </label>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? '提交中...' : '提交' }}
        </button>
        <button type="button" @click="handleCancel" class="cancel-btn">取消</button>
      </div>
    </form>
  </div>
</template>

<script setup>
// 新增：导入 defineEmits
import { ref, onMounted, computed, defineEmits } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter, useRoute } from 'vue-router';
// 修改导入语句 - 确保已导入adminService和userService
import { adminService } from '../../services/admin/adminService';
import { userService } from '../../services/userService';
// import { permissionService } from '../../services/permissionService';

// 响应式变量
const userForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  roleId: '',
  // 将初始状态值改为数字 1（表示启用）
  status: 1
});
const roles = ref([]);
const isSubmitting = ref(false);
const isEditing = computed(() => !!route.params.id);

const router = useRouter();
const route = useRoute();

// 加载角色列表
const loadRoles = async () => {
  try {
    const result = await adminService.getRoles();
    roles.value = result || [];
  } catch (error) {
    console.error('加载角色列表失败:', error);
    ElMessage.error('加载角色列表失败: ' + (error.message || '未知错误'));
  }
};

// 加载用户信息（编辑模式）
const loadUserInfo = async () => {
  try {
    const userId = route.params.id;
    const user = await userService.getUserById(userId);
    if (user) {
      userForm.value = {
        username: user.username,
        email: user.email,
        roleId: user.role ? user.role.id : '',
        status: user.status || 'active',
        password: '',
        confirmPassword: ''
      };
    }
  } catch (error) {
    console.error('加载用户信息失败:', error);
    ElMessage.error('加载用户信息失败: ' + (error.message || '未知错误'));
    router.push('/manager/users');
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

  if (!isEditing.value) {
    if (!userForm.value.password || userForm.value.password.length < 6) {
      ElMessage.error('密码长度不能少于6位');
      return false;
    }

    if (userForm.value.password !== userForm.value.confirmPassword) {
      ElMessage.error('两次输入的密码不一致');
      return false;
    }
  }

  if (!userForm.value.roleId) {
    ElMessage.error('请选择角色');
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
      roleId: userForm.value.roleId,
      status: userForm.value.status
    };

    if (!isEditing.value) {
      formData.password = userForm.value.password;
    }

    if (isEditing.value) {
      // 编辑用户仍使用userService.updateUser
      await userService.updateUser(route.params.id, formData);
      ElMessage.success('编辑人员成功');
      emit('success'); // 触发success事件
    } else {
      // 创建用户使用adminService.createUser
      await adminService.createUser(formData);
      ElMessage.success('添加人员成功');
      emit('success'); // 触发success事件
    }

    router.push('/manager/users');
  } catch (error) {
    console.error(isEditing.value ? '编辑人员失败' : '添加人员失败:', error);
    ElMessage.error(
      (isEditing.value ? '编辑人员失败' : '添加人员失败') + ': ' + (error.message || '未知错误')
    );
  } finally {
    isSubmitting.value = false;
  }
};

// 定义事件并获取emit函数
const emit = defineEmits(['close']);

// 取消操作
const handleCancel = () => {
  // 使用emit函数触发close事件
  emit('close');
};

// 初始加载
onMounted(() => {
  loadRoles();
  if (isEditing.value) {
    loadUserInfo();
  }
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