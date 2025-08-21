<template>
  <div class="user-role-container">
    <div class="page-header">
      <h1>分配角色 - {{ userInfo.username }}</h1>
    </div>
    <div class="user-role">
      用户现角色：<br>
      <div class="user-role-show">
        {{ userInfo.roles?.map(role => role?.name).join('、') ?? '——' }}
      </div>
    </div>
    <div class="role-card">
      <div class="card-header">
        <h2>角色分配</h2>
      </div>
      <div class="card-body">
        <div class="role-selection">
          <label class="form-label">选择角色 <span class="required">*</span></label>
          <select v-model="selectedRoleId" class="form-select" @change="handleRoleChange">
            <option value="">请选择角色</option>
            <option v-for="role in adminStore.roleList.value" :key="role.id" :value="role.id">{{ role.name }}</option>
          </select>
        </div>

        <div v-if="selectedRoleId" class="role-permissions">
          <h3>角色权限预览</h3>
          <div class="permission-list">
            <div v-for="permission in rolePermissions" :key="permission.id" class="permission-item">
              <input
                type="checkbox"
                :id="'perm-' + permission.id"
                :checked="true"
                disabled
              />
              <label :for="'perm-' + permission.id">{{ permission.name }} ({{ permission.description }})</label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button @click="handleSaveRole" class="save-btn" :disabled="isSaving">
        {{ isSaving ? '保存中...' : '保存角色' }}
      </button>
      <button @click="handleCancel" class="cancel-btn">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits, watch } from 'vue';
import { ElMessage } from 'element-plus';  // 导入Element Plus消息组件
import { useRouter } from 'vue-router';  // 导入路由钩子
import { adminService } from '../../services/admin/adminService';  // 导入管理员服务
import { useAdminStore } from '../../stores/adminStore';  // 导入adminStore

// 定义props
const props = defineProps({
  userId: {
    type: String,
    required: true  // 用户ID为必需参数
  }
});

// 定义emit
const emit = defineEmits(['close']);

// 响应式变量
const userInfo = ref({});  // 用户信息
const selectedRoleId = ref('');  // 选中的角色ID
const rolePermissions = ref([]);  // 角色对应的权限
const isSaving = ref(false);  // 是否正在保存

const router = useRouter();  // 路由实例
const adminStore = useAdminStore();  // 获取adminStore实例

// 监听角色选择变化，加载对应权限
watch(selectedRoleId, (newRoleId) => {
  loadRolePermissions(newRoleId);
});

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const userId = props.userId;
    if (!userId) {
      ElMessage.error('用户ID不能为空');
      router.push('/manager/users');  // 跳转到用户列表页
      return;
    }
    const user = await adminService.getUserById(userId);  // 获取用户信息
    if (user) {
      userInfo.value = user;
      const userRoles=await adminService.getUserRoles(userId);
      userInfo.value.roles = userRoles;  // 存储用户现有权限
      selectedRoleId.value = user.role ? user.role.id : '';  // 设置用户当前角色



      // 加载用户现有角色
      
    }
  } catch (error) {
    console.error('加载用户信息失败:', error);
    ElMessage.error('加载用户信息失败: ' + (error.message || '未知错误'));
    router.push('/manager/users');  // 出错时跳转到用户列表页
  }
};

// 加载角色列表
const loadRoles = async () => {
  try {
    // 优先使用adminStore中的数据
    if (adminStore.roleList.value && adminStore.roleList.value.length > 0) {
      // 直接使用store中的数据
    } else {
      // 数据不存在时调用service方法
      await adminService.getRoles();
    }
    // 无论哪种方式，最终都从store中获取数据
  } catch (error) {
    console.error('加载角色列表失败:', error);
    ElMessage.error('加载角色列表失败: ' + (error.message || '未知错误'));
  }
};

// 加载角色权限
const loadRolePermissions = async (roleId) => {
  try {
    if (!roleId) {
      rolePermissions.value = [];
      return;
    }

    // 尝试从adminStore.roleList中查找角色权限
    console.log('-----------------------------------------------',roleId);
    const role = adminStore.roleList.value.find(r => r.id === roleId);
    if (role && role.permissions) {
      rolePermissions.value = role.permissions;
    } else {
      // 如果store中没有，调用service方法
      const result = await adminService.getRolePermissions(roleId);
      // 确保正确处理响应格式
      rolePermissions.value = result?.data?.data || result || [];
    }
  } catch (error) {
    console.error('加载角色权限失败:', error);
    ElMessage.error('加载角色权限失败: ' + (error.message || '未知错误'));
  }
};

// 保存角色分配
const handleSaveRole = async () => {
  isSaving.value = true;  // 设置保存中状态
  try {
    if (!selectedRoleId.value) {
      ElMessage.error('请选择角色');
      return;
    }

    // 提交角色分配
    await adminService.updateUserRole(props.userId, {
      roleId: selectedRoleId.value
    });

    ElMessage.success('角色分配成功');
    emit('close');  // 触发close事件通知父组件关闭
    router.push('/manager/users');  // 成功后跳转到用户列表页
  } catch (error) {
    console.error('保存角色分配失败:', error);
    ElMessage.error('保存角色分配失败: ' + (error.message || '未知错误'));
  } finally {
    isSaving.value = false;  // 无论成功失败，都重置保存状态
  }
};

// 取消操作
const handleCancel = () => {
  router.push('/manager/users');  // 跳转到用户列表页
  emit('close');  // 触发close事件通知父组件关闭
};

// 处理角色选择变化
const handleRoleChange = () => {
  loadRolePermissions(selectedRoleId.value);
};

// 初始加载
onMounted(async () => {
  await loadUserInfo();  // 加载用户信息
  
  // 优先使用adminStore中的数据，如果没有则加载
  if (!adminStore.roleList.value || adminStore.roleList.value.length === 0) {
    await loadRoles();  // 加载角色列表
  }
  
  if (selectedRoleId.value) {
    await loadRolePermissions(selectedRoleId.value);  // 如果有选中的角色，加载其权限
  }
});
</script>

<style scoped>
.user-role-show {
    /* 关键：首行向左“伸出”2em，后续行向右缩进2em */
    text-indent: 2em;  /* 首行负缩进（向左突出） */
    padding-left: 2em;  /* 左侧留白，配合负缩进形成悬挂效果 */
    line-height: 1.6;   /* 优化行间距，增强可读性 */
    color: green;
  }
.user-role-container {
  padding: 20px;
  color: #333;
}

.page-header {
  margin-bottom: 20px;
}

.role-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.card-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
}

.card-body {
  padding: 10px 0;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.required {
  color: #ef4444;
}

.form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
  margin-bottom: 15px;
}

.role-permissions {
  margin-top: 15px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.permission-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.permission-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.permission-item input[type="checkbox"] {
  margin-right: 8px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}

.save-btn, .cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.save-btn {
  background-color: #3b82f6;
  color: white;
}

.cancel-btn {
  background-color: #d1d5db;
  color: #333;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>