<template>
  <div class="user-management-container">
    <div class="page-header">
      <h1>人员管理</h1>
      <button @click="handleAddUser" class="add-user-btn">添加人员</button>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-filter-container">
      <div class="search-input-group">
        <input
          type="text"
          v-model="searchKeyword"
          placeholder="搜索用户名或邮箱"
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch" class="search-btn">搜索</button>
      </div>
      <!-- 角色筛选下拉框，从adminStore.roleList获取数据 -->
      <div class="filter-group">
        <select v-model="roleFilter" class="filter-select">
          <option value="">所有角色</option>
          <option v-for="role in adminStore.roleList.value" :key="role.id" :value="role.id">{{ role.name }}</option>
        </select>
        <select v-model="statusFilter" class="filter-select">
          <option value="">所有状态</option>
          <option value="1">正常</option>
          <option value="2">禁用</option>
        </select>
      </div>
    </div>

    <!-- 人员列表 -->
    <div class="user-table-container">
      <table class="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>昵称／用户名</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.nickname || user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ getUserRoles(user.roles || user.role) }}</td>
            <td>
              <span :class="getStatusClass(user.status)">
                {{ getStatusText(user.status) }}
              </span>
            </td>
            <td>{{ DataUtils.formatDate(user.created_at) }}</td>
            <td class="action-buttons">
              <button @click="handleViewUser(user.id)" class="view-btn">查看编辑</button>
              <button @click="handleUpdatePassword(user.id)" class="password-btn">修改密码</button>
              <button @click="handleAssignPermission(user.id)" class="permission-btn">分配权限</button>
              <button @click="handleAssignRole(user.id)" class="role-btn">分配角色</button>
              <button @click="handleDeleteUser(user.id)" class="delete-btn">删除</button>
              <button @click="handleToggleStatus(user.id, user.status)" class="toggle-btn">
                {{ user.status === 1 ? '禁用' : '启用' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <button @click="currentPage > 1 && currentPage--" :disabled="currentPage === 1">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="currentPage < totalPages && currentPage++" :disabled="currentPage === totalPages">下一页</button>
    </div>

    <!-- 新增：添加人员的模态框 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加人员"
      width="50%"
      :destroy-on-close="true"
    >
      <UserForm @close="handleFormClose" @success="handleFormSuccess" />
    </el-dialog>

    <!-- 权限分配的模态框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="分配权限"
      width="60%"
      :destroy-on-close="true"
    >
      <UserPermission :userId="selectedUserId" @close="permissionDialogVisible = false" />
    </el-dialog>

    <!-- 角色分配的模态框 -->
    <el-dialog
      v-model="roleDialogVisible"
      title="分配角色"
      width="50%"
      :destroy-on-close="true"
    >
      <UserRole :userId="selectedUserId" @close="roleDialogVisible = false" />
    </el-dialog>

    <!-- 用户详情的模态框 -->
    <el-dialog
      v-model="profileDialogVisible"
      title="员工详情"
      width="80%"
      :destroy-on-close="true"
    >
      <EmployeeProfile :userId="selectedUserId" />
    </el-dialog>

    <!-- 修改密码的模态框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="40%"
      :destroy-on-close="true"
    >
      <div class="password-form">
        <div class="form-group">
          <label class="form-label">新密码 <span class="required">*</span></label>
          <input
            type="password"
            v-model="newPassword"
            placeholder="请输入新密码（至少6位）"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label class="form-label">确认新密码 <span class="required">*</span></label>
          <input
            type="password"
            v-model="confirmPassword"
            placeholder="请再次输入新密码"
            class="form-input"
          />
        </div>
        <div class="form-tips">
          <span>密码长度至少6位</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <button type="button" @click="handlePasswordDialogClose" class="cancel-btn">取消</button>
          <button type="button" @click="handleSubmitPassword" class="submit-btn">确定</button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { ElMessage, ElDialog, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { adminService } from '../../services/admin/adminService';
import { useAdminStore } from '../../stores/adminStore.js';
import { DataUtils } from '../../utils/data.js'; // 导入日期工具
// 新增：导入 UserForm 组件
import UserForm from './UserForm.vue';
// 导入 UserPermission 组件
import UserPermission from './UserPermission.vue';
// 导入 UserRole 组件
import UserRole from './UserRole.vue';
// 导入 EmployeeProfile 组件
import EmployeeProfile from './EmployeeProfile.vue';

// 组件会在script setup中自动注册

// 获取store实例
const adminStore = useAdminStore();

// 响应式变量
const searchKeyword = ref('');
const roleFilter = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const isLoading = ref(false);

// 计算属性，从adminStore获取数据
const users = computed(() => adminStore.userList.value);
const totalCount = computed(() => adminStore.userListTotalCount || 0);
// 新增：定义 dialogVisible 变量
const dialogVisible = ref(false);
// 权限分配对话框变量
const permissionDialogVisible = ref(false);
// 角色分配对话框变量
const roleDialogVisible = ref(false);
const selectedUserId = ref('');
// 用户详情对话框变量
const profileDialogVisible = ref(false);
// 修改密码对话框变量
const passwordDialogVisible = ref(false);
const newPassword = ref('');
const confirmPassword = ref('');

const router = useRouter();

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(totalCount.value / pageSize.value);
});

// 根据角色数组获取角色名称列表
const getUserRoles = (roles) => {
  if (!roles) return '-';
  
  // 处理数组形式的角色数据
  if (Array.isArray(roles)) {
    if (roles.length === 0) return '-';
    return roles.map(role => role.name || role).join(', ');
  }
  
  // 如果是字符串类型的角色名称，直接返回
  if (typeof roles === 'string') {
    return roles;
  }
  
  // 处理对象形式的角色数据（如果有name属性）
  if (roles && typeof roles === 'object' && roles.name) {
    return roles.name;
  }
  
  return '-';
};

// 获取用户状态文本
const getStatusText = (status) => {
  switch (status) {
    case 1:
      return '正常';
    case 2:
      return '禁用';
    default:
      return '未知';
  }
};

// 获取用户状态对应的CSS类
const getStatusClass = (status) => {
  switch (status) {
    case 1:
      return 'status-active';
    case 2:
      return 'status-pending';
    default:
      return '';
  }
};

// 加载人员列表
const loadUsers = async () => {
  isLoading.value = true;
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      roleId: roleFilter.value,
      status: statusFilter.value
    };

    // 调用服务获取数据，数据会自动存储到adminStore中
    await adminService.getUsers(params);
  } catch (error) {
    console.error('加载人员列表失败:', error);
    ElMessage.error('加载人员列表失败: ' + (error.message || '未知错误'));
  } finally {
    isLoading.value = false;
  }
};

// 加载角色列表
const loadRoles = async () => {
  try {
    // 优先使用adminStore中的数据
    if (!adminStore.roleList.value || adminStore.roleList.value.length === 0) {
      await adminService.getRoles();
    }
  } catch (error) {
    console.error('加载角色列表失败:', error);
    ElMessage.error('加载角色列表失败: ' + (error.message || '未知错误'));
  }
};

// 搜索人员
const handleSearch = () => {
  currentPage.value = 1;
  loadUsers();
};



// 编辑人员
const handleEditUser = (userId) => {
  // router.push(`/manager/user/${userId}/edit`);
};

// 分配权限
const handleAssignPermission = (userId) => {
  selectedUserId.value = String(userId);
  permissionDialogVisible.value = true;
};

// 分配角色
const handleAssignRole = (userId) => {
  selectedUserId.value = String(userId);
  roleDialogVisible.value = true;
};

// 查看用户详情
const handleViewUser = (userId) => {
  selectedUserId.value = String(userId);
  console.log(userId, 'handleViewUser+++++++++++++++++++++++++++++');
  profileDialogVisible.value = true;
};

// 打开修改密码对话框
const handleUpdatePassword = (userId) => {
  selectedUserId.value = String(userId);
  newPassword.value = '';
  confirmPassword.value = '';
  passwordDialogVisible.value = true;
};

// 关闭修改密码对话框
const handlePasswordDialogClose = () => {
  passwordDialogVisible.value = false;
};

// 提交修改密码
const handleSubmitPassword = async () => {
  try {
    // 表单验证
    if (!newPassword.value || newPassword.value.length < 6) {
      ElMessage.error('密码长度不能少于6位');
      return;
    }
    
    if (newPassword.value !== confirmPassword.value) {
      ElMessage.error('两次输入的密码不一致');
      return;
    }
    
    // 调用服务层修改密码
    const isSuccess = await adminService.updateUserPassword(selectedUserId.value, newPassword.value);
    
    if (isSuccess) {
      ElMessage.success('密码修改成功');
      passwordDialogVisible.value = false;
    }
  } catch (error) {
    console.error('修改密码失败:', error);
    ElMessage.error('修改密码失败: ' + (error.message || '未知错误'));
  }
};

// 删除人员
const handleDeleteUser = async (userId) => {
    try {
      await ElMessageBox.confirm('确定要删除该人员吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });

      // 确保调用正确的删除API
      const isSuccess = await adminService.deleteUser(userId);
      if (isSuccess) {
        ElMessage.success('删除成功');
        loadUsers(); // 重新加载列表
      }
    } catch (error) {
      // 如果是用户取消操作，不显示错误信息
      // 更健壮地检查是否是用户取消操作
      if (!error.message.includes('cancel')) {
        console.error('删除人员失败:', error);
        ElMessage.error('删除人员失败: ' + (error.message || '未知错误'));
      }
    }
};

// 切换人员状态
const handleToggleStatus = async (userId, currentStatus) => {
  try {
    let newStatus = currentStatus === 1 ? 2 : 1; // 简化逻辑：正常↔禁用

    const isSuccess = await adminService.updateUserStatus(userId, newStatus);
    if (isSuccess) {
      ElMessage.success(`已${newStatus === 1 ? '启用' : '禁用'}该人员`);
      loadUsers(); // 重新加载列表
    }
  } catch (error) {
    console.error('更新人员状态失败:', error);
    ElMessage.error('更新人员状态失败: ' + (error.message || '未知错误'));
  }
};

// 初始加载
onMounted(async () => {
  // 优先加载角色数据，因为用户列表可能需要角色信息进行筛选
  await loadRoles();
  
  // 加载用户数据
  loadUsers();
});

// 监听分页和筛选变化
watch([currentPage, roleFilter, statusFilter], (newValues, oldValues) => {
  // 检查角色或状态筛选是否发生变化
  if (newValues[1] !== oldValues[1] || newValues[2] !== oldValues[2]) {
    currentPage.value = 1; // 重置为第一页
  }
  loadUsers();
});
// 修改：添加人员方法，显示模态框
const handleAddUser = () => {
  dialogVisible.value = true;
};

// 新增：处理表单成功提交的方法
const handleFormSuccess = () => {
  dialogVisible.value = false;
  ElMessage.success('添加人员成功');
  loadUsers(); // 重新加载人员列表
};

const handleFormClose = () => {
  dialogVisible.value = false;
};
</script>

<style scoped>
.user-management-container {
  padding: 20px;
  color: #333;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-user-btn {
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.search-filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.search-input-group {
  display: flex;
  gap: 10px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}

.search-btn {
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.filter-group {
  display: flex;
  gap: 10px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.user-table-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th {
  background-color: #f5f5f5;
  padding: 12px;
  text-align: center; /* 表头文字居中 */
  border-bottom: 2px solid #ddd;
}

.user-table td {
  padding: 12px;
  border-bottom: 1px solid #ddd;
  text-align: center; /* 表格内容居中 */
}

.status-active {
  color: #10b981;
  font-weight: 500;
}

.status-inactive {
  color: #f59e0b;
  font-weight: 500;
}

.status-pending {
  color: #6366f1;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center; /* 按钮居中 */
}

.view-btn, .edit-btn, .permission-btn, .delete-btn, .toggle-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.view-btn {
  background-color: #60a5fa;
  color: white;
}

.edit-btn {
  background-color: #10b981;
  color: white;
}

.permission-btn {
  background-color: #f59e0b;
  color: white;
}

.role-btn {
  background-color: #10b981;
  color: white;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.delete-btn {
  background-color: #ef4444;
  color: white;
}

.toggle-btn {
  background-color: #8b5cf6;
  color: white;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
}

.pagination-container button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
}

/* 禁用按钮样式 */
button:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
  opacity: 0.6;
}

/* 修改密码按钮样式 */
.password-btn {
  background-color: #3b82f6;
  color: white;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

/* 密码表单样式 */
.password-form {
  padding: 20px 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.required {
  color: #ef4444;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-tips {
  color: #666;
  font-size: 12px;
  margin-top: -10px;
  margin-bottom: 20px;
}

/* 对话框按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn,
.submit-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn {
  background-color: #f3f4f6;
  color: #333;
}

.submit-btn {
  background-color: #3b82f6;
  color: white;
}

/* // 为不同类型的禁用按钮添加特定样式（可选） */
.delete-btn:disabled,
.toggle-btn:disabled {
  background-color: #f0f0f0;
  border-color: #ddd;
}
</style>