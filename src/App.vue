<script setup>
import { onMounted } from 'vue';
import { useAnnouncementStore } from '@/stores/announcementStore';
import { useUserStore } from '@/stores/userStore';

// 在应用挂载时获取最新公告和初始化用户
onMounted(() => {
  const announcementStore = useAnnouncementStore();
  announcementStore.loadLatestAnnouncement();
  
  const userStore = useUserStore();
  userStore.initUser();
});
</script>

<template>
  <router-view />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
