<template>
  
  <div class="home-container">
    <!-- 顶部流动条 -->
    <HorizontalFlowingBar
    :speed="100" 
    class="top-flowing-bar"
    v-if="announcementContent"
    >
    {{ announcementContent }}
    </HorizontalFlowingBar> 



  

    <!-- 顶部导航栏 -->
    <header class="navbar">
      <div class="logo">
         <span>建设工程检查报告管理系统</span>
      </div>
    </header>
  </div>    
</template>

<script>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useAnnouncementStore } from '@/stores/announcementStore'
// import TopFlowingBar from './components/TopFlowingBar.vue'
import HorizontalFlowingBar from './components/HorizontalFlowingBar.vue'    

export default {
  name: 'Home',
  components: {
    // TopFlowingBar,
    HorizontalFlowingBar
  },

  setup() {
    // 获取公告store
    const announcementStore = useAnnouncementStore();
    

    // 计算属性：获取最新公告内容
    const announcementContent = computed(() => {
      if (announcementStore.latestAnnouncement) {
        return '⚠️' + announcementStore.latestAnnouncement.content;

      }
      // 默认公告内容
      return '⚠️ 系统将于今晚23:00进行维护，预计持续2小时，期间可能无法访问';
    });

    return {
      announcementContent
    };
  },

    
}
</script>

<style scoped>



.top-flowing-bar {
  textColor: #b1e15d;

}


.home-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
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

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
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

/* 最近报告区域样式 */
.recent-reports {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.view-all-btn {
  padding: 6px 12px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.view-all-btn:hover {
  background-color: #2563eb;
}

/* 表格样式 */
.reports-table {
  width: 100%;
  border-collapse: collapse;
}

.reports-table th,
.reports-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.reports-table th {
  background-color: #f9fafb;
  font-weight: bold;
  color: #4b5563;
}

.reports-table tr:hover {
  background-color: #f9fafb;
}

/* 状态标签样式 */
.status-pending {
  display: inline-block;
  padding: 4px 8px;
  background-color: #fef3c7;
  color: #92400e;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-completed {
  display: inline-block;
  padding: 4px 8px;
  background-color: #d1fae5;
  color: #065f46;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-rejected {
  display: inline-block;
  padding: 4px 8px;
  background-color: #fee2e2;
  color: #b91c1c;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* 操作按钮样式 */
.action-btn {
  padding: 6px 12px;
  background-color: #60a5fa;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.action-btn:hover {
  background-color: #3b82f6;
}
</style>