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
    <aside class="app-aside">
      <div class="brand">📋 飞书报工</div>
      <t-menu theme="dark" :value="active" @change="onMenuChange">
        <t-menu-item value="/projects">项目管理</t-menu-item>
        <t-menu-item value="/reports">报工管理</t-menu-item>
        <t-menu-item v-if="auth.isAdmin" value="/calendar">日历配置</t-menu-item>
        <t-menu-item v-if="auth.isAdmin" value="/settings">系统设置</t-menu-item>
      </t-menu>
    </aside>
    <div class="app-main">
      <header class="app-header">
        <span class="spacer" />
        <span class="user-name">{{ auth.user?.name || '' }}</span>
        <t-button theme="default" variant="text" @click="logout">退出</t-button>
      </header>
      <main class="app-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const active = computed(() => route.path);

function onMenuChange(value: string | number | undefined | null) {
  if (typeof value === 'string') router.push(value);
}

function logout() {
  auth.logout();
  router.push('/login');
}

onMounted(() => auth.fetchMe());
</script>

<style scoped>
.app-shell {
  display: flex;
  height: 100vh;
}
.app-aside {
  width: 220px;
  background: #1d1d1f; /* DESIGN: surface-black 近黑导航 */
  display: flex;
  flex-direction: column;
}
.brand {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.02em;
  padding: 20px 20px 12px;
}
.app-aside :deep(.t-menu) {
  flex: 1;
  background: transparent;
  border-right: none;
}
.app-aside :deep(.t-menu__item) {
  color: #c0c4cc;
}
.app-aside :deep(.t-menu__item.t-is-active) {
  color: #2997ff; /* DESIGN: primary-on-dark */
  background: rgba(255, 255, 255, 0.06);
}
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
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
</style>
