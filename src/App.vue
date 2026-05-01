<script setup lang="ts">
/**
 * 根组件 - 整体布局
 * 包含：顶部导航栏 + 左侧菜单栏 + 右侧主内容区
 */
</script>

<template>
  <div id="app" class="app-container">
    <router-view />
  </div>
</template>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
