<template>
  <div class="manager-layout">
    <el-container class="container">
      <!-- 侧边栏 -->
      <el-aside width="200px" class="sidebar">
        <div class="logo-container">
          <img src="@/assets/logo.svg" alt="系统 logo" class="logo" />
          <h2 class="system-name">管理系统</h2>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="manager-menu"
          text-color="#303133"
          active-text-color="#409EFF"
          background-color="#F2F3F5"
          :unique-opened="true"
          :collapse-transition="false"
          router
        >
          <el-menu-item index="/manager/users">
            <template #title>
              <i class="pi pi-user mr-2"></i>
              <span>人员管理</span>
            </template>
          </el-menu-item>
          <el-menu-item index="/manager/roles">
            <template #title>
              <i class="pi pi-key mr-2"></i>
              <span>角色管理</span>
            </template>
          </el-menu-item>
          <el-menu-item index="/manager/settings" v-if="false">
            <template #title>
              <i class="pi pi-cog mr-2"></i>
              <span>系统设置</span>
            </template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container class="main-content">
        <!-- 顶部导航 -->
        <el-header class="header">
          <div class="header-left">
            <i class="pi pi-home home-icon" @click="handleGoHome" style="cursor: pointer; margin-right: 5px; font-size: 1.2rem; color: #42b983; transition: all 0.3s ease;"></i>
            <span @click="handleGoHome" style="cursor: pointer;">返回主页</span>
          </div>
          <div class="header-right">
            <el-dropdown placement="bottom-end">
              <span class="user-info">
                <el-avatar :size="32" :src="userInfo.avatar || '@/assets/default-avatar.png'" />
                
                <span class="username">{{ userInfo.username || '管理员' }}</span>
                <i class="pi pi-chevron-down arrow-down"></i>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handlePersonalCenter">个人中心</el-dropdown-item>
                  <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <!-- 内容区域 -->
        <el-main class="content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
// 移除Element Plus图标导入，使用PrimeIcons替代
import { userService } from '@/services/userService';

// 响应式数据
const userInfo = ref({});
const route = useRoute();
const router = useRouter();

// 计算当前激活的菜单
const activeMenu = computed(() => {
  return route.path;
});

// 生命周期钩子
onMounted(() => {
  initUserInfo();
});

// 初始化用户信息
async function initUserInfo() {
  try {
    const userData = await userService.handleGetUser();
    if (userData) {
      userInfo.value = userData;
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    ElMessage.error('获取用户信息失败');
  }
}

// 回到主页
function handleGoHome() {
  router.push('/home');
}

// 个人中心
function handlePersonalCenter() {
  ElMessage('暂未开发');
  // router.push('/user/info');
}

// 退出登录
async function handleLogout() {
  try {
    await userService.handleLogout();
    router.push('/login');
    ElMessage.success('退出登录成功');
  } catch (error) {
    console.error('退出登录失败:', error);
    ElMessage.error('退出登录失败');
  }
}
</script>

<style scoped>
.manager-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  height: 100%;
  overflow: hidden;
}

.sidebar {
  background-color: #F2F3F5;
  border-right: 1px solid #E4E7ED;
  display: flex;
  flex-direction: column;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  border-bottom: 1px solid #E4E7ED;
}

.logo {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.system-name {
  font-size: 18px;
  font-weight: bold;
  color: #1F2937;
}

.manager-menu {
  flex: 1;
  overflow-y: auto;
  padding-top: 10px;
}

.main-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  border-bottom: 1px solid #E4E7ED;
  background-color: #FFFFFF;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #F2F3F5;
}

.username {
  margin-left: 10px;
  margin-right: 5px;
  font-size: 14px;
}

.arrow-down {
  font-size: 16px;
  color: #909399;
}

.content {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  background-color: #F7F8FA;
}
</style>