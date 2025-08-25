<template>
  <div class="user-profile dropdown">
    <!-- 头像区域 -->
    <div class="profile-trigger" @click="toggleDropdown">
      <img
        :src="userAvatar"
        alt="用户头像"
        class="avatar rounded-full border-2 border-white shadow-md transition-all duration-300 hover:scale-110"
      />
      <span class="username ml-2 hidden md:inline-block">{{ username }}</span>
      <i class="el-icon-caret-bottom ml-1 text-gray-500"></i>
    </div>

    <!-- 下拉菜单 -->
    <div
      v-if="isDropdownOpen"
      class="dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 transition-all duration-300 transform origin-top-right"
    >
      <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" @click.prevent="viewProfile">
        <i class="el-icon-user mr-2"></i>个人信息
      </a>
      <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" @click.prevent="viewSettings">
        <i class="el-icon-setting mr-2"></i>账户设置
      </a>
      <div class="border-t border-gray-100 my-1"></div>
      <a href="#" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100" @click.prevent="logout">
        <i class="el-icon-switch-button mr-2"></i>退出登录
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore.js';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getuserService } from '../../services/userService';

// 响应式变量
const isDropdownOpen = ref(false);
const username = ref('用户名');
const userAvatar = ref('https://picsum.photos/id/1005/200/200'); // 默认头像

// 引入Store和Router
const userStore = useUserStore();
const userService = getuserService();
const router = useRouter();

// 初始化用户数据
onMounted(() => {
  if (userStore.user) {
    username.value = userStore.user.nickname || userStore.user.username || '用户名';
    // 如果有用户头像，替换默认头像
    if (userStore.user.avatar) {
      userAvatar.value = userStore.user.avatar;
    }
  }
});

// 切换下拉菜单显示状态
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// 关闭下拉菜单
const closeDropdown = () => {
  isDropdownOpen.value = false;
};

// 点击页面其他地方关闭下拉菜单
// 在组件挂载后添加事件监听
onMounted(() => {
  document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.dropdown');
    if (dropdown && !dropdown.contains(e.target)) {
      closeDropdown();
    }
  });
});

// 查看个人信息
const viewProfile = () => {
  closeDropdown();
  // 这里可以添加跳转到个人信息页面的逻辑
  router.push('/profile');
};

// 查看账户设置
const viewSettings = () => {
  closeDropdown();
  // 这里可以添加跳转到账户设置页面的逻辑
  // router.push('/settings');
};

// 退出登录
const logout = async () => {
  closeDropdown();
  try {
    await userService.handleLogout();
    ElMessage.success('退出登录成功');
  } catch (error) {
    ElMessage.error('退出登录失败: ' + error.message);
    console.error('退出登录失败:', error);
  }
};
</script>

<style scoped>
.user-profile {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 16px;
  cursor: pointer;
}

.avatar {
  width: 40px;
  height: 40px;
  object-fit: cover;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.dropdown-menu {
  min-width: 150px;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.dropdown-menu {
  animation: fadeIn 0.2s ease-out;
}
</style>