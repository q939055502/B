<template>
  <div class="not-found-container">
    <h1>404</h1>
    <p>页面不存在</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<script setup>
// 404 页面组件逻辑
</script>

<style scoped>
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}

h1 {
  font-size: 8rem;
  margin-bottom: 1rem;
  color: #ff4d4f;
}

p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

a {
  color: #1890ff;
  text-decoration: none;
  font-size: 1.2rem;
}

a:hover {
  text-decoration: underline;
}
</style>