<template>
  <div class="role-management-container">
    <div class="page-header">
      <h1>角色管理</h1>
      <button @click="handleAddRole" class="add-role-btn">新增角色</button>
    </div>

    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="输入角色名称搜索"
        :prefix-icon="Search"
        class="search-input"
      />
      <button @click="handleSearch" class="search-btn">搜索</button>
    </div>

    <div class="role-table-container">
      <el-table :data="roleList" border stripe class="role-table" v-loading="isLoading">
        <el-table-column prop="id" label="角色ID" width="80" />
        <el-table-column prop="name" label="角色名称" width="180" />
        <el-table-column prop="description" label="角色描述" width="280" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column prop="updated_at" label="更新时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <button @click="handleDeleteRole(scope.row)" class="delete-btn">删除</button>
            <button @click="handleViewPermissions(scope.row)" class="permissions-btn">权限设置</button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

      <!-- 新增/编辑角色弹窗 -->
      <el-dialog
        v-model="roleDialogVisible"
        :title="'新增角色'"
        width="500px"
      >
        <el-form ref="roleFormRef" :model="roleForm" :rules="roleFormRules" label-width="100px">
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
          </el-form-item>
          <el-form-item label="角色描述" prop="description">
            <el-input v-model="roleForm.description" type="textarea" placeholder="请输入角色描述" />
          </el-form-item>
        </el-form>
        <template #footer>
          <button @click="roleDialogVisible = false" class="cancel-btn">取消</button>
          <button @click="handleSaveRole" class="save-btn" :disabled="isSaving">
            {{ isSaving ? '保存中...' : '保存' }}
          </button>
        </template>
      </el-dialog>

      <!-- 角色权限设置弹窗 -->
      <RolePermission
        v-if="showPermissionDialog"
        :roleId="currentRoleId"
        @close="handlePermissionDialogClose"
      />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { adminService } from '../../services/admin/adminService';
import { useAdminStore } from '../../stores/adminStore';
import RolePermission from './RolePermission.vue';
// 已移除路由跳转，不需要useRouter导入

// 响应式变量
const searchKeyword = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const roleDialogVisible = ref(false);

const roleForm = reactive({
  id: '',
  name: '',
  description: ''
});
const roleFormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '角色名称长度在 2 到 20 个字符之间', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '角色描述最多 200 个字符', trigger: 'blur' }
  ]
};
const roleFormRef = ref(null);
const isSaving = ref(false);
const isLoading = ref(false); // 添加加载状态变量
const adminStore = useAdminStore();

// 从store中获取所有角色
const allRoles = computed(() => adminStore.roleList.value);

// 根据搜索和分页条件过滤角色
const roleList = computed(() => {
  // 搜索过滤
  let filteredRoles = allRoles.value || []; // 确保filteredRoles总是一个数组
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    filteredRoles = filteredRoles.filter(role => 
      role.name.toLowerCase().includes(keyword) || 
      role.description.toLowerCase().includes(keyword)
    );
  }

  // 分页处理
  total.value = filteredRoles.length;
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filteredRoles.slice(startIndex, endIndex);
});

// 加载角色列表
const loadRoles = async () => {
  isLoading.value = true;
  try {
    console.log('开始加载角色列表...');
    const roles = await adminService.getRoles();
    console.log('角色列表加载完成，数据:', roles);
    console.log('adminStore中的角色列表:', adminStore.roleList);
    // adminService.getRoles会自动更新adminStore.roleList
  } catch (error) {
    console.error('加载角色列表失败:', error);
    ElMessage.error('加载角色列表失败: ' + (error.message || '未知错误'));
  } finally {
    isLoading.value = false;
    console.log('加载状态已设置为false');
  }
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
  // 不需要重新加载，computed属性会自动更新
};

// 处理分页大小变化
const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1;
  // 不需要重新加载，computed属性会自动更新
};

// 处理当前页码变化
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;
  // 不需要重新加载，computed属性会自动更新
};

// 处理新增角色
const handleAddRole = () => {
  Object.keys(roleForm).forEach(key => {
    roleForm[key] = '';
  });
  roleDialogVisible.value = true;
};

// 处理保存角色
const handleSaveRole = async () => {
  // 表单验证
  const valid = await roleFormRef.value.validate();
  if (!valid) return;

  isSaving.value = true;
  try {
    // 新增角色
    await adminService.createRole({
      name: roleForm.name,
      description: roleForm.description
    });
    ElMessage.success('角色创建成功');
    roleDialogVisible.value = false;
    loadRoles(); // 保存成功后重新加载角色列表
  } catch (error) {
    console.error('保存角色失败:', error);
    ElMessage.error('保存角色失败: ' + (error.message || '未知错误'));
  } finally {
    isSaving.value = false;
  }
};

// 处理删除角色
const handleDeleteRole = async (role) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 '${role.name}' 吗？删除后将无法恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    await adminService.deleteRole(role.id);
    ElMessage.success('角色删除成功');
    loadRoles(); // 删除成功后重新加载角色列表
  } catch (error) {
    // 如果用户取消操作，不显示错误消息
    if (error !== 'cancel') {
      console.error('删除角色失败:', error);
      ElMessage.error('删除角色失败: ' + (error.message || '未知错误'));
    }
  }
};

// 响应式变量 for 权限弹窗
const showPermissionDialog = ref(false);
const currentRoleId = ref('');

// 处理查看角色权限
const handleViewPermissions = (role) => {
  currentRoleId.value = String(role.id);
  showPermissionDialog.value = true;
};

// 处理权限弹窗关闭
const handlePermissionDialogClose = () => {
  showPermissionDialog.value = false;
  currentRoleId.value = '';
};

// 页面加载时执行
onMounted(() => {
  loadRoles();
});
</script>

<style scoped>
.role-management-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-role-btn {
  padding: 6px 12px;
  background-color: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.search-bar {
  display: flex;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  margin-right: 10px;
}

.search-btn {
  padding: 6px 12px;
  background-color: #67C23A;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.role-table-container {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
}

.edit-btn {
  padding: 4px 10px;
  background-color: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
  min-width: 60px;
}

.delete-btn {
  padding: 4px 10px;
  background-color: #F56C6C;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
  min-width: 60px;
}

.permissions-btn {
  padding: 4px 10px;
  background-color: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  min-width: 80px;
}

.cancel-btn {
  padding: 6px 12px;
  background-color: #F2F3F5;
  color: #606266;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}

.save-btn {
  padding: 6px 12px;
  background-color: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>