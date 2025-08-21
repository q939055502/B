<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <header class="navbar">
      <div class="logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
        <span>建设工程检查报告管理系统</span>
      </div>
      <div class="right-actions">
          <button @click="navigateToReportManagement" class="report-btn">管理报告</button>
          <button @click="navigateToManager" class="report-btn">人员管理</button>
          <button @click="handleLoginOrLogout" class="login-btn">{{ access_token ? '退出登录' : '登录' }}</button>
        </div>
    </header>

    <!-- 主要内容区 -->
    <main class="main-content">
      <!-- 欢迎信息 -->
      <section class="welcome-section">
        <h1>欢迎使用建设工程检查报告管理系统</h1>
        <p>高效管理工程检查数据，提升工程质量监管水平</p>
      </section>

      <!-- 统计卡片 -->
      <section class="stats-section">
        <div class="stat-card">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div class="stat-info">
            <h3>总报告数</h3>
            <p class="stat-value">{{ total || '——' }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
          </div>
          <div class="stat-info">
            <h3>待处理</h3>
            <p class="stat-value">——</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div class="stat-info">
            <h3>已完成</h3>
            <p class="stat-value">——</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <div class="stat-info">
            <h3>不合格</h3>
            <p class="stat-value">——</p>
          </div>
        </div>
      </section>


    </main>
  </div>
</template>

<script>

import { useRouter } from 'vue-router'; 
import { onMounted } from 'vue';// 导入onMounted
import { storeToRefs } from 'pinia';
import { useUserStore } from '../../stores/userStore';
import { getuserService } from '../../services/userService';

import { useReportStore } from '../../stores/reportStore';
import { getReportService } from '../../services/reportService';



  
  


export default {
  name: 'Home',
  setup() {
    const router = useRouter();
    const userService = getuserService();
    const userStore = useUserStore();
    const { access_token } = storeToRefs(userStore);

    const reportStore = useReportStore();
    const reportService=getReportService();

    const { total } = storeToRefs(reportStore);

   onMounted(async () => {
      console.log('页面初始化，获取报告总数');
    await reportService.handleGetReportsTotal();

    });


    // 导航到报告管理页面
    const navigateToReportManagement = () => {
      router.push({ name: 'EngineeringManagement' });
    };
    // 导航到人员管理页面
    const navigateToManager = () => {
      router.push({ name: 'Manager' });
    };
    // 处理登录/退出登录点击事件
    const handleLoginOrLogout = () => {
      if (access_token.value) {
        // 已登录，执行退出登录
        userService.handleLogout();
      } else {
        // 未登录，导航到登录页面
        router.push({ name: 'Login' });
      }
    };
    
    return {
      reportStore,
      access_token,
      total,
      
      handleLoginOrLogout,
      navigateToReportManagement,
      navigateToManager
    };
  },
  data() {
    return {
      // 这里可以添加组件数据
    };
  },
  
};
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 20px 0;
}

/* 导航栏样式 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: #1e40af;
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.right-actions {
  display: flex;
  gap: 15px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
}

/* 删除无用的.user-info样式 */

.report-btn {
  padding: 6px 12px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.report-btn:hover {
  background-color: #2563eb;
}

.login-btn {
  padding: 6px 12px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #2563eb;
}

/* 主要内容区样式 */
.main-content {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* 欢迎区域样式 */
.welcome-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.welcome-section h1 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #333;
}

.welcome-section p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

/* 统计卡片区域样式 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-right: 15px;
  border-radius: 50%;
  background-color: #e0f2fe;
  color: #0284c7;
}

.stat-info h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #666;
  font-weight: normal;
}

.stat-value {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}


</style>