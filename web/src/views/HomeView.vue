<!--
 * @Author: 17630921248 1245634367@qq.com
 * @Date: 2026-08-04 11:11:25
 * @LastEditors: 17630921248 1245634367@qq.com
 * @LastEditTime: 2026-08-04 11:11:26
 * @FilePath: \feishu-work-web\web\src\views\HomeView.vue
 * @Description: Fuck Bug
 * 微信：lizx2066
-->
<!--
 * @Author: lzx 1245634367@qq.com
 * @Description: 首页：功能入口 grid 布局（无侧边栏）
-->
<template>
  <div class="home">
    <div class="home-hero">
      <h1 class="home-title">你好，{{ auth.user?.name || '同事' }}</h1>
      <p class="home-sub">选择功能，开始今天的报工工作</p>
    </div>

    <div class="home-grid">
      <div
        v-for="item in menus"
        :key="item.path"
        class="home-card"
        role="button"
        tabindex="0"
        @click="go(item.path)"
        @keyup.enter="go(item.path)"
      >
        <div class="card-icon" :style="{ background: item.bg }">{{ item.icon }}</div>
        <div class="card-title">{{ item.title }}</div>
        <div class="card-desc">{{ item.desc }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();

function go(path: string) {
  router.push(path);
}

const menus = computed(() => {
  const all = [
    { path: '/projects', icon: '📁', title: '项目管理', desc: '创建和维护项目信息', bg: 'linear-gradient(135deg, #e8f0fe, #d6e6fb)' },
    { path: '/reports', icon: '📝', title: '报工管理', desc: '提交工时，跟踪审批状态', bg: 'linear-gradient(135deg, #eef6ec, #dcefe0)' },
    { path: '/calendar', icon: '📅', title: '日历配置', desc: '维护节假日与调休规则', bg: 'linear-gradient(135deg, #fff4e5, #ffe8cc)', adminOnly: true },
    { path: '/settings', icon: '⚙️', title: '系统设置', desc: '管理员与通讯录管理', bg: 'linear-gradient(135deg, #f2f2f5, #e8e8ed)', adminOnly: true },
  ];
  return auth.isAdmin ? all : all.filter((m) => !m.adminOnly);
});
</script>

<style scoped>
.home {
  max-width: 1080px;
  margin: 0 auto;
  padding: 8px 0 40px;
}
.home-hero {
  margin-bottom: 28px;
}
.home-title {
  font-size: 34px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #1d1d1f;
  margin: 0 0 6px;
}
.home-sub {
  color: #6e6e73;
  font-size: 16px;
  margin: 0;
}

/* 功能卡片 grid：自适应列数 */
.home-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
.home-card {
  background: #ffffff;
  border: 1px solid var(--td-component-border);
  border-radius: 18px;
  padding: 24px;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}
.home-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--td-brand-color);
}
.home-card:active {
  transform: translateY(0);
}
.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 16px;
}
.card-title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #1d1d1f;
  margin-bottom: 4px;
}
.card-desc {
  font-size: 13px;
  color: #86868b;
  line-height: 1.5;
}

@media (max-width: 720px) {
  .home-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  .home-card {
    padding: 18px;
  }
  .card-icon {
    width: 44px;
    height: 44px;
    font-size: 22px;
    border-radius: 12px;
  }
  .home-title {
    font-size: 26px;
  }
}
</style>
