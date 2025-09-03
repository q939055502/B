<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleCancel"
  >
    <div class="role-permission-container">
      <div class="role-info">
        <h2>角色信息</h2>
        <p><strong>角色名称：</strong> {{ roleInfo.name }}</p>
        <p><strong>角色描述：</strong> {{ roleInfo.description }}</p>
      </div>

      <div class="current-permissions">
        <h2>当前拥有权限</h2>
        <div class="permission-list">
          {{ currentPermissions.length > 0 ? currentPermissions.map(perm => perm.description).join('、') : '——' }}
        </div>
      </div>

      <div class="permission-card">
        <div class="card-header">
          <h2 class="card-title">分配权限</h2>
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
        <button @click="handleCancel" class="cancel-btn">取消</button>
        <button @click="handleSavePermissions" class="save-btn" :disabled="isSaving">
          {{ isSaving ? '保存中...' : '保存权限' }}
        </button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, defineEmits } from 'vue';
import { ElMessage } from 'element-plus';
import { adminService } from '../../services/admin/adminService';
import { useAdminStore } from '../../stores/adminStore';

// 定义emits
const emit = defineEmits(['close']);

// 定义props
const props = defineProps({
  roleId: {
    type: String,
    required: true
  }
});

// 响应式变量
const dialogVisible = ref(true);
const dialogTitle = ref('角色权限设置');
const roleInfo = ref({});
const currentPermissions = ref([]);
const selectedPermissions = ref({});
const selectAllPermissions = ref(false);
const isSaving = ref(false);
const permissions = ref([]);
const permissionGroups = ref([]);

const adminStore = useAdminStore();

// 加载角色信息
const loadRoleInfo = () => {
  try {
    // 从adminStore中查找角色信息，使用宽松相等以避免类型问题
    const role = adminStore.roleList.value.find(r => r.id == props.roleId);
    if (role) {
      roleInfo.value = role;
      dialogTitle.value = `角色权限设置 - ${role.name}`;
    } else {
      ElMessage.warning('未找到该角色信息');
      // 未找到角色时自动关闭弹窗
      setTimeout(() => {
        emit('close');
        dialogVisible.value = false;
      }, 1500);
    }
  } catch (error) {
    console.error('加载角色信息失败:', error);
    ElMessage.error('加载角色信息失败: ' + (error.message || '未知错误'));
  }
};

// 加载角色当前权限
const loadRolePermissions = async () => {
  try {
    const permissions = await adminService.getRolePermissions(props.roleId);
    currentPermissions.value = permissions;
    permissions.forEach(perm => {
      selectedPermissions.value[perm.id] = true;
    });
  } catch (error) {
    console.error('加载角色权限失败:', error);
    ElMessage.error('加载角色权限失败: ' + (error.message || '未知错误'));
  }
};

// 加载所有权限并分组
const loadAllPermissions = async () => {
  try {
    // 优先使用adminStore中的数据
    if (adminStore.permissionList.value && adminStore.permissionList.value.length > 0) {
      permissions.value = adminStore.permissionList.value;
    } else {
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
    selectedPermissions.value[perm.id] = group.checked;
  });

  // 更新全选状态
  selectAllPermissions.value = permissions.value.every(perm => selectedPermissions.value[perm.id]);
};

// 监听全选状态变更
watch(selectAllPermissions, (newValue) => {
  permissions.value.forEach(perm => {
    selectedPermissions.value[perm.id] = newValue;
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
}, { deep: true });

// 保存权限分配
const handleSavePermissions = async () => {
  isSaving.value = true;
  try {
    // 收集选中的权限ID
    const permissionIds = Object.entries(selectedPermissions.value)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);

    // 过滤无效的权限ID
    const validPermissionIds = permissionIds.filter(id => id !== undefined && id !== null && id !== 'undefined');

    // 提交权限分配
    await adminService.updateRolePermissions(props.roleId, {
      permission_ids: validPermissionIds
    });

    ElMessage.success('权限分配成功');
    emit('close');
    dialogVisible.value = false;
  } catch (error) {
    console.error('保存权限分配失败:', error);
    ElMessage.error('保存权限分配失败: ' + (error.message || '未知错误'));
  } finally {
    isSaving.value = false;
  }
};

// 取消操作
const handleCancel = () => {
  emit('close');
  dialogVisible.value = false;
  // 重置状态，确保下次打开时重新加载数据
  roleInfo.value = {};
  currentPermissions.value = [];
  selectedPermissions.value = {};
  selectAllPermissions.value = false;
  permissions.value = [];
  permissionGroups.value = [];
};

// 初始加载
onMounted(async () => {
  await loadRoleInfo();
  await loadRolePermissions();
  await loadAllPermissions();
});
</script>

<style scoped>
.role-permission-container {
  padding: 10px;
  color: #333;
}

.role-info {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.current-permissions {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.permission-list {
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  color: green;
}

.permission-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.card-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
}

.card-body {
  padding: 10px 0;
}

.permission-groups {
  margin-top: 15px;
}

.permission-group {
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.group-header {
  padding: 10px;
  background-color: #e9e9e9;
  font-weight: 600;
}

.group-permissions {
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
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
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.save-btn, .cancel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
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