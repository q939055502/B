<template>
  <div class="empty-layout">
    <!-- 直接显示路由对应的页面内容 -->
    <router-view />
  </div>
</template>

<style scoped>
.empty-layout {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
