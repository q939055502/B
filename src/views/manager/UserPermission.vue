<template>
  <div class="user-permission-container">
    <div class="page-header">
      <h1>分配权限 - {{ userInfo.username }}</h1>
    </div>
    <div class="user-permissions">
      
      用户现拥有权限：<br>
      <div class="user-permission-show">
        {{ userInfo.permissions?.map(perm => perm?.description).join('、') ?? '——' }}
      </div>
    </div>

    <div class="permission-card">
      <div class="card-header">
        <h2 class="card-title">自定义权限</h2>
        <div class="toggle-all">
          <label>
            <input type="checkbox" v-model="selectAllPermissions" />
            {{ selectAllPermissions ? '取消全选' : '全选' }}
          </label>
        </div>
      </div>
      <div class="card-body">
        <div class="permission-groups">
          <div v-for="group in permissionGroups" :key="group.id" class="permission-group">
            <div class="group-header">
              <label>
                <input
                  type="checkbox"
                  v-model="group.checked"
                  
                  @change="handleGroupCheck(group)"
                />
                {{ group.name }}
              </label>
            </div>
            <div class="group-permissions">
              <div v-for="permission in group.permissions" :key="permission.id" class="permission-item">
                <input
                  type="checkbox"
                  :id="'perm-' + permission.id"
                  v-model="selectedPermissions[permission.id]"
                />
                <label :for="'perm-' + permission.id">{{ permission.name }} ({{ permission.description }})</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button @click="handleSavePermissions" class="save-btn" :disabled="isSaving">
        {{ isSaving ? '保存中...' : '保存权限' }}
      </button>
      <button @click="handleCancel" class="cancel-btn">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, defineProps, defineEmits } from 'vue';  // 导入Vue相关API

// 定义emits
const emit = defineEmits(['close']);
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

// 响应式变量
const userInfo = ref({});  // 用户信息
const selectedPermissions = ref({});  // 选中的权限
const selectAllPermissions = ref(false);  // 是否全选权限
const isSaving = ref(false);  // 是否正在保存
const permissions = ref([]);  // 所有权限列表
const permissionGroups = ref([]);  // 权限分组

const router = useRouter();  // 路由实例
const adminStore = useAdminStore();  // 获取adminStore实例

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
      // 加载用户现有权限
      const userPermissions = await adminService.getUserPermissions(userId);
      userInfo.value.permissions = userPermissions;  // 存储用户现有权限
      userPermissions.forEach(perm => {
        selectedPermissions.value[perm.id] = true;  // 设置已选中的权限
      });
    }
  } catch (error) {
    console.error('加载用户信息失败:', error);
    ElMessage.error('加载用户信息失败: ' + (error.message || '未知错误'));
    router.push('/manager/users');  // 出错时跳转到用户列表页
  }
};

// 加载权限列表并分组
const loadPermissions = async () => {
  try {
    // 优先使用adminStore中的数据
    if (adminStore.permissionList.value && adminStore.permissionList.value.length > 0) {
      permissions.value = adminStore.permissionList.value;
    } else {
      // 数据不存在时调用service方法
      await adminService.getPermissions();
      permissions.value = adminStore.permissionList.value || [];
    }

    // 按资源分组
    const groups = {};
    permissions.value.forEach(permission => {
      const resource = permission.resource || '未分类';
      if (!groups[resource]) {
        groups[resource] = {
          id: resource,
          name: resource,
          permissions: []
        };
      }
      groups[resource].permissions.push(permission);
    });

    permissionGroups.value = Object.values(groups);

    // 初始化分组选中状态
    permissionGroups.value.forEach(group => {
      group.checked = group.permissions.every(perm => selectedPermissions.value[perm.id]);
    });

    // 初始化全选状态
    selectAllPermissions.value = permissions.value.every(perm => selectedPermissions.value[perm.id]);
  } catch (error) {
    console.error('加载权限列表失败:', error);
    ElMessage.error('加载权限列表失败: ' + (error.message || '未知错误'));
  }
};

// 处理分组选中状态变更
const handleGroupCheck = (group) => {
  group.permissions.forEach(perm => {
    selectedPermissions.value[perm.id] = group.checked;  // 设置组内所有权限的选中状态
  });

  // 更新全选状态
  selectAllPermissions.value = permissions.value.every(perm => selectedPermissions.value[perm.id]);
};

// 监听全选状态变更
watch(selectAllPermissions, (newValue) => {
  permissions.value.forEach(perm => {
    selectedPermissions.value[perm.id] = newValue;  // 设置所有权限的选中状态
  });

  // 更新分组选中状态
  permissionGroups.value.forEach(group => {
    group.checked = newValue;
  });
});

// 监听权限选中状态变更，更新分组和全选状态
watch(selectedPermissions, (newValue) => {
  // 更新分组选中状态
  permissionGroups.value.forEach(group => {
    group.checked = group.permissions.every(perm => newValue[perm.id]);
  });

  // 更新全选状态
  selectAllPermissions.value = permissions.value.every(perm => newValue[perm.id]);
}, { deep: true });  // 深度监听对象变化

// 保存权限分配
const handleSavePermissions = async () => {
  isSaving.value = true;  // 设置保存中状态
  try {
    // 收集选中的权限ID
    const permissionIds = Object.entries(selectedPermissions.value)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);

    // 提交权限分配
    // 过滤掉permissionIds中的undefined值
    const validPermissionIds = permissionIds.filter(id => id !== undefined && id !== null && id !== 'undefined');
    await adminService.updateUserPermissions(props.userId, {
permission_ids: validPermissionIds  // 注意参数名改为permission_ids以匹配API要求
    });

    ElMessage.success('权限分配成功');
    router.push('/manager/users');  // 成功后跳转到用户列表页
    emit('close');  // 触发close事件通知父组件关闭
  } catch (error) {
    console.error('保存权限分配失败:', error);
    ElMessage.error('保存权限分配失败: ' + (error.message || '未知错误'));
  } finally {
    isSaving.value = false;  // 无论成功失败，都重置保存状态
  }
};

// 取消操作
const handleCancel = () => {
  router.push('/manager/users');  // 跳转到用户列表页
  emit('close');  // 触发close事件通知父组件关闭
};

// 初始加载
onMounted(async () => {
  await loadUserInfo();  // 加载用户信息
  
  if (!adminStore.permissionList.value || adminStore.permissionList.value.length === 0) {
    await loadPermissions();  // 加载权限列表
  } else {
    // 直接使用store中的数据初始化权限相关状态
    permissions.value = adminStore.permissionList.value;
    
    // 按资源分组
    const groups = {};
    permissions.value.forEach(permission => {
      const resource = permission.resource || '未分类';
      if (!groups[resource]) {
        groups[resource] = {
          id: resource,
          name: resource,
          permissions: []
        };
      }
      groups[resource].permissions.push(permission);
    });

    permissionGroups.value = Object.values(groups);
    
    // 初始化分组选中状态
    permissionGroups.value.forEach(group => {
      group.checked = group.permissions.every(perm => selectedPermissions.value[perm.id]);
    });
    
    // 初始化全选状态
    selectAllPermissions.value = permissions.value.every(perm => selectedPermissions.value[perm.id]);
  }
  
});
</script>

<style scoped>

.user-permission-show {
    /* 关键：首行向左“伸出”2em，后续行向右缩进2em */
    text-indent: 2em;  /* 首行负缩进（向左突出） */
    padding-left: 2em;  /* 左侧留白，配合负缩进形成悬挂效果 */
    line-height: 1.6;   /* 优化行间距，增强可读性 */
    color: green;
  }

.user-permission-container {
  padding: 20px;
  color: #333;
}

.page-header {
  margin-bottom: 20px;
}

.permission-card {
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

.card-title {
  margin-bottom: 10px;
}

.toggle-all {
  margin-top: 10px;
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

.permission-groups {
  margin-top: 15px;
  column-gap: 20px;
}

.permission-group {
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  column-count: 2;
}



.group-header {
  padding: 10px;
  background-color: #e9e9e9;
  font-weight: 600;
}

.group-permissions {
  padding: 10px;
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