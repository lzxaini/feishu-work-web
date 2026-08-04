<!--
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:44:26
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:44:27
 * @FilePath: \feishu-work\web\src\components\AppLayout.vue
 * @Description: Fuck Bug
 * 微信：lizx2066
-->
<template>
  <div class="app-shell">
    <header class="app-header">
      <button class="brand" @click="router.push('/')">📋 飞书报工</button>
      <span class="spacer" />
      <span class="user-name">{{ auth.user?.name || '' }}</span>
      <t-button theme="default" variant="text" @click="logout">退出</t-button>
    </header>
    <main class="app-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

function logout() {
  auth.logout();
  router.push('/login');
}

onMounted(() => auth.fetchMe());
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.app-header {
  height: 52px;
  background: rgba(245, 245, 247, 0.8);
  backdrop-filter: saturate(180%) blur(20px); /* DESIGN: sub-nav-frosted */
  border-bottom: 1px solid var(--td-component-border);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px;
  flex-shrink: 0;
}
.brand {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #1d1d1f;
  padding: 4px 0;
}
.brand:hover {
  color: var(--td-brand-color);
}
.spacer {
  flex: 1;
}
.user-name {
  font-size: 14px;
  color: #1d1d1f;
}
.app-content {
  flex: 1;
  padding: 24px 32px 48px;
  overflow: auto;
}

@media (max-width: 720px) {
  .app-header {
    padding: 0 16px;
  }
  .app-content {
    padding: 16px 16px 40px;
  }
}
</style>
