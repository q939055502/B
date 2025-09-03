<template>
  <div class="employee-profile" @click="handleOutsideClick">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载员工信息中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <ElIcon name="WarningFilled" class="text-red-500" />
      <p>{{ error }}</p>
      <button @click="fetchEmployeeData" class="retry-btn">重试</button>
    </div>

    <!-- 员工信息卡片 -->
     <div v-else class="profile-card">
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <!-- <ElButton type="primary" @click="saveEditing" v-if="isEditing">保存</ElButton> -->
        <!-- 假设关闭按钮在这里，实际项目中可能需要调整 -->
        <!-- <ElButton v-if="closeable" @click="saveEditing" type="primary" size="large" style="margin-left: 12px; padding: 10px 20px; border-radius: 6px; font-weight: bold;">保存</ElButton> -->
      </div>
      
      <!-- 头部信息 -->
      <div class="profile-header">
        <div class="avatar-container">
          <img 
            :src="employee.avatar || defaultAvatar" 
            :alt="employee.nickname || employee.username" 
            class="avatar"
            @error="handleAvatarError"
          >
          <span v-if="employee.status === '正常'" class="status-indicator active"></span>
          <span v-else class="status-indicator inactive"></span>
        </div>
        
        <div class="header-info">
          <div class="name-section">
            <h1 class="full-name">{{ employee.nickname || employee.username }}</h1>
            <span class="username">{{ employee.username }}</span>
            <!-- <span class="user-id">#{{ employee.id }}</span> -->
          </div>
          
          <div class="position-info">
            <p class="position">{{ employee.position_name || '未设置' }}</p>
            <p class="department" v-if="employee.department_id">部门 ID: {{ employee.department_id }}</p>
          </div>
        </div>
      </div>

      <!-- 主要内容区 -->
      <div class="profile-content">
        <div class="info-section personal-info">
          <h2 class="section-title">
            <ElIcon name="UserFilled" /> 个人信息
          </h2>
          <div class="info-grid">
            <div class="info-item" @click.stop="startEditing('nickname', employee.nickname)">
  <span class="label">昵称：</span>
  <span v-if="!isFieldEditing('nickname')" class="value">{{ employee.nickname || '未设置' }}</span>
  <div v-else class="edit-container" @click.stop>
    <ElInput v-model="editValues.nickname" placeholder="请输入昵称" size="small" @blur="saveEditing" />
    
  </div>
</div>
            <div class="info-item" @click.stop="startEditing('gender', employee.gender)">
  <span class="label">性别：</span>
  <span v-if="!isFieldEditing('gender')" class="value">{{ formatGender(employee.gender) }}</span>
  <div v-else class="edit-container" @click.stop>
    <ElSelect v-model="editValues.gender" placeholder="请选择性别" size="small" @change="saveEditing">
      <ElOption label="未知" value="0" />
      <ElOption label="男" value="1" />
      <ElOption label="女" value="2" />
    </ElSelect>
    
  </div>
</div>
            <div class="info-item" @click.stop="startEditing('birthday', employee.birthday)">
  <span class="label">出生日期：</span>
  <span v-if="!isFieldEditing('birthday')" class="value">{{ formatDate(employee.birthday) }}</span>
  <div v-else class="edit-container" @click.stop>
    <ElDatePicker
      v-model="editValues.birthday"
      type="date"
      placeholder="选择日期"
      size="small"
      @change="saveEditing"
      @blur="saveEditing"
    />
    
  </div>
</div>
            <div class="info-item" @click.stop="startEditing('id_card_number', employee.id_card_number)">
  <span class="label">身份证号：</span>
  <span v-if="!isFieldEditing('id_card_number')" class="value">{{ maskIdCard(employee.id_card_number) }}</span>
  <div v-else class="edit-container" @click.stop>
    <ElInput v-model="editValues.id_card_number" placeholder="请输入身份证号" size="small" @blur="saveEditing" />
    
  </div>
</div>
            <div class="info-item" @click.stop="startEditing('address', employee.address)">
  <span class="label">地址：</span>
  <span v-if="!isFieldEditing('address')" class="value">{{ employee.address || '未设置' }}</span>
  <div v-else class="edit-container" @click.stop>
    <ElInput v-model="editValues.address" placeholder="请输入地址" size="small" @blur="saveEditing" />
    
  </div>
</div>
            <div class="info-item" @click.stop="startEditing('bio', employee.bio)">
  <span class="label">个人简介：</span>
  <span v-if="!isFieldEditing('bio')" class="value">{{ employee.bio || '无' }}</span>
  <div v-else class="edit-container" @click.stop>
    <ElInput v-model="editValues.bio" type="textarea" placeholder="请输入个人简介" size="small" @blur="saveEditing" />
    
  </div>
</div>
          </div>
        </div>
        
        <div class="info-section contact-info">
          <h2 class="section-title">
            <ElIcon name="ContactFilled" /> 联系方式
          </h2>
          <div class="info-grid">
            <div class="info-item" @click.stop="startEditing('email', employee.email)">
  <span class="label">电子邮箱：</span>
  <span v-if="!isFieldEditing('email')" class="value contact-link">
    {{ employee.email || '未设置' }}
    <ElIcon v-if="employee.email" name="MessageFilled" />
  </span>
  <div v-else class="edit-container" @click.stop>
    <ElInput v-model="editValues.email" placeholder="请输入电子邮箱" size="small" @blur="saveEditing" />
    
  </div>
</div>
            <div class="info-item" @click.stop="startEditing('phone_number', employee.phone_number)">
  <span class="label">电话号码：</span>
  <span v-if="!isFieldEditing('phone_number')" class="value contact-link">
    {{ employee.phone_number || '未设置' }}
    <ElIcon v-if="employee.phone_number" name="PhoneFilled" />
  </span>
  <div v-else class="edit-container" @click.stop>
    <ElInput v-model="editValues.phone_number" placeholder="请输入电话号码" size="small" @blur="saveEditing" />
    
  </div>
</div>
          </div>
        </div>

        <div class="info-section employment-info">
          <h2 class="section-title">
            <ElIcon name="BriefcaseFilled" /> 雇佣信息
          </h2>
          <div class="info-grid">
            <div class="info-item" @click.stop="startEditing('employment_type', employee.employment_type)">
  <span class="label">雇佣类型：</span>
  <span v-if="!isFieldEditing('employment_type')" class="value">{{ formatEmploymentType(employee.employment_type) || '未设置' }}</span>
  <div v-else class="edit-container" @click.stop>
    <ElSelect v-model="editValues.employment_type" placeholder="请选择雇佣类型" size="small" @change="saveEditing">
      <ElOption label="全职" value="1" />
      <ElOption label="兼职" value="2" />
      <ElOption label="实习" value="3" />
    </ElSelect>
    
  </div>
</div>
            <div class="info-item" @click.stop="startEditing('hire_date', employee.hire_date)">
  <span class="label">入职日期：</span>
  <span v-if="!isFieldEditing('hire_date')" class="value">{{ formatDate(employee.hire_date) }}</span>
  <div v-else class="edit-container" @click.stop>
    <ElDatePicker
      v-model="editValues.hire_date"
      type="date"
      placeholder="选择日期"
      size="small"
      @change="saveEditing"
      @blur="saveEditing"
    />
    
  </div>
</div>
            <div class="info-item" @click.stop="startEditing('position_name', employee.position_name)">
  <span class="label">岗位名称：</span>
  <span v-if="!isFieldEditing('position_name')" class="value">{{ employee.position_name || '未设置' }}</span>
  <div v-else class="edit-container" @click.stop>
    <ElInput v-model="editValues.position_name" placeholder="请输入岗位名称" size="small" @blur="saveEditing" />
    
  </div>
</div>
            <div class="info-item" @click.stop="startEditing('department_id', employee.department_id)">
  <span class="label">部门ID：</span>
  <span v-if="!isFieldEditing('department_id')" class="value">{{ employee.department_id || '未设置' }}</span>
  <div v-else class="edit-container" @click.stop>
    <ElInput v-model="editValues.department_id" placeholder="请输入部门ID" size="small" @blur="saveEditing" />
    
  </div>
</div>
          </div>
        </div>

        <div class="info-section account-info">
          <h2 class="section-title">
            <ElIcon name="KeyFilled" /> 账号信息
          </h2>
          <div class="info-grid">
            <InfoItem label="账号状态" :value="formatStatus(employee.status)" />
            <InfoItem label="创建时间" :value="formatDateTime(employee.created_at)" />
            <InfoItem label="更新时间" :value="formatDateTime(employee.updated_at)" />
            <InfoItem label="最后登录时间" :value="formatDateTime(employee.last_login_at) || '从未登录'" />
            <InfoItem label="最后注销时间" :value="formatDateTime(employee.last_logout_at) || '未注销'" />
          </div>
        </div>

        <div v-if="employee.ext_info" class="info-section extended-info">
          <h2 class="section-title">
            <ElIcon name="InfoFilled" /> 扩展信息
          </h2>
          <div class="extended-content">
            <pre>{{ JSON.stringify(employee.ext_info, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 导入adminService
import { adminService } from '@/services/admin/adminService';
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useAdminStore } from '@/stores/adminStore';
import { userModelFieldMap } from '@/utils/modelFieldMaps';
import { ElInput, ElSelect, ElOption, ElDatePicker, ElButton } from 'element-plus';

// 编辑状态管理
const editingField = ref(null); // 存储当前正在编辑的字段名
const editValues = ref({}); // 存储各字段的编辑值
const editForm = ref({}); // 编辑表单数据

// 计算属性用于判断是否处于编辑模式
const isEditing = computed(() => {  const value = editingField.value !== null;  return value;});

// 判断特定字段是否正在编辑
const isFieldEditing = (field) => {
  return editingField.value === field;
};

// 开始编辑字段
const startEditing = (field, value) => {
  editingField.value = field;
  // 初始化该字段的编辑值
  editValues.value[field] = value;
  // 深拷贝当前employee数据到编辑表单
  editForm.value = { ...employee.value };
  nextTick(() => {
  });
};

// 点击外部区域退出编辑模式
const handleOutsideClick = (e) => {
  if (editingField.value) {
    // 不需要重置编辑值，因为下次编辑会重新初始化
    // 设置editingField为null，退出编辑模式
    nextTick(() => {
      editingField.value = null;
    });
  }
};

// 保存编辑
const saveEditing = async () => {
  if (!editingField.value) return;
  
  // 更新employee数据
  employee.value[editingField.value] = editValues.value[editingField.value];
  
  // 准备提交给后端的数据
  const userData = {
    [editingField.value]: editValues.value[editingField.value]
  };
  
  // 调用adminService更新用户数据
  const updateSuccess = await adminService.updateUser(props.userId, userData);
  
  if (updateSuccess) {
    // 同步到admin store
    try {
      const index = adminStore.userList.findIndex(u => String(u.id) === props.userId);
      if (index !== -1) {
        adminStore.userList[index] = { ...adminStore.userList[index], [editingField.value]: editValues.value[editingField.value] };
      }
    } catch (e) {
      console.error('保存到store失败:', e);
    }
    
    // 退出编辑模式
    nextTick(() => {
      editingField.value = null;
    });
  }
};

  // 定义props
const props = defineProps({
  userId: {
    type: String,
    required: true
  },
  closeable: {
    type: Boolean,
    default: true
  }
});

// 关闭方法
const handleClose = () => {
  // 这里实现关闭逻辑，例如路由跳转或emit事件
  // 示例：使用路由返回
  const router = useRouter();
  router.back();
}

// 引入路由钩子
import { useRouter } from 'vue-router';



// 获取admin store
const adminStore = useAdminStore();
import InfoItem from './InfoItem.vue'; // 信息项组件
import { ElIcon } from 'element-plus';

// 模拟默认头像
const defaultAvatar = 'https://picsum.photos/200/200?random=1';

// 状态管理
const loading = ref(true);
const error = ref(null);
const employee = ref({});

// 格式化性别显示
const formatGender = (gender) => {
  if (gender === undefined || gender === null) return '未设置';
  const genderMap = { 0: '未知', 1: '男', 2: '女' };
  return genderMap[gender] || '未知';
};

// 格式化状态显示
const formatStatus = (status) => {
  if (status === undefined || status === null) return '未知';
  return status === 1 ? '正常' : '异常';
};

// 格式化雇佣类型显示
const formatEmploymentType = (type) => {
  if (type === undefined || type === null) return '未知';
  const typeMap = { 1: '全职', 2: '兼职', 3: '实习' };
  return typeMap[type] || '未知';
};

// 格式化日期（仅日期）
const formatDate = (dateString) => {
  if (!dateString) return '未设置';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
};

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
};

// 身份证号脱敏
const maskIdCard = (idCard) => {
  if (!idCard) return '未设置';
  return idCard.replace(/(\d{6})(\d{8})(\d{4})/, '$1********$3');
};

// 处理头像加载失败
const handleAvatarError = (e) => {
  e.target.src = defaultAvatar;
};

// 获取员工数据
const fetchEmployeeData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    console.log('props.userId:', props.userId);
    
    // 使用adminService获取用户信息
    const user = await adminService.getUserById(props.userId);
    
    if (user) {
      // 找到用户，赋值给employee
      employee.value = user;
      console.log('成功获取用户信息:', user);
    } else {
      // 未找到用户
      error.value = '未找到该员工信息';
      console.error('未找到用户，ID:', props.userId);
    }
  } catch (e) {
    error.value = '获取员工信息失败: ' + e.message;
    console.error('获取员工信息失败:', e);
  } finally {
    loading.value = false;
  }
};

// 监听userId变化，重新获取数据
watch(() => props.userId, () => {
  if (props.userId) {
    fetchEmployeeData();
  }
});

// 组件挂载时获取数据
onMounted(() => {
  fetchEmployeeData();
});
</script>

<style scoped>
/* 编辑模式样式 */
.edit-container {
  display: flex !important;
  gap: 8px;
  margin-top: 4px;
  padding: 4px 0;
}

/* 操作按钮样式 */
.action-buttons {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 12px; /* 设置按钮间隔 */
}

/* 确保卡片有相对定位，使绝对定位的按钮生效 */
.profile-card {
  position: relative;
}

.info-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.info-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

/* 保持原有样式 */
.employee-profile {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 4rem 0;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error-state {
  text-align: center;
  padding: 4rem 0;
  color: #dc3545;
}

.error-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-btn:hover {
  background-color: #0056b3;
}

/* 卡片样式 */
.profile-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.profile-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* 头部信息 */
.profile-header {
  display: flex;
  flex-wrap: wrap;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e9ecef;
}

.avatar-container {
  position: relative;
  margin-right: 2rem;
  margin-bottom: 1rem;
}

.avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.avatar:hover {
  transform: scale(1.05);
}

.status-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid white;
}

.status-indicator.active {
  background-color: #28a745;
}

.status-indicator.inactive {
  background-color: #dc3545;
}

.header-info {
  flex: 1;
  min-width: 300px;
}

.name-section {
  margin-bottom: 1rem;
}

.full-name {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  color: #2d3436;
}

.username {
  display: inline-block;
  margin-right: 1rem;
  color: #6c757d;
  font-size: 0.95rem;
  background: rgba(0, 0, 0, 0.05);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
}

.user-id {
  color: #6c757d;
  font-size: 0.9rem;
}

.position-info {
  color: #495057;
}

.position {
  margin: 0 0 0.3rem 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.department {
  margin: 0;
  font-size: 0.95rem;
  color: #6c757d;
}

/* 内容区域 */
.profile-content {
  padding: 2rem;
}

.info-section {
  margin-bottom: 2.5rem;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-title {
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.7rem;
  border-bottom: 2px solid #e9ecef;
  color: #2d3436;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
}

.section-title i {
  margin-right: 0.7rem;
  color: #007bff;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.2rem;
}

/* 扩展信息 */
.extended-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
}

.extended-content pre {
  margin: 0;
  color: #495057;
  font-size: 0.95rem;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .avatar-container {
    margin-right: 0;
    margin-bottom: 1.5rem;
  }
  
  .name-section {
    margin-bottom: 1rem;
  }
  
  .full-name {
    font-size: 1.7rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
