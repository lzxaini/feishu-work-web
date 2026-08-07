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

    <div class="quick-report" role="button" tabindex="0" @click="go('/reports/new')" @keyup.enter="go('/reports/new')">
      <div class="quick-report-icon">📝</div>
      <div class="quick-report-text">
        <div class="quick-report-title">一键报工</div>
        <div class="quick-report-desc">选择项目、填写工时，快速提交今天的报工</div>
      </div>
      <div class="quick-report-arrow">→</div>
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
    { path: '/approvals', icon: '✅', title: '审批管理', desc: '审批名下项目的报工', bg: 'linear-gradient(135deg, #fff4e5, #ffe8cc)' },
    { path: '/stats', icon: '📊', title: '报工统计', desc: '按用户与日期统计报工，一键提醒', bg: 'linear-gradient(135deg, #e6f7f0, #cdeeda)', adminOnly: true },
    { path: '/calendar', icon: '📅', title: '日历配置', desc: '维护节假日与调休规则', bg: 'linear-gradient(135deg, #f6f4ff, #e9e4fb)', adminOnly: true },
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

/* 一键报工横幅 */
.quick-report {
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, #0066cc 0%, #0071e3 100%);
  border-radius: 18px;
  padding: 18px 22px;
  margin-bottom: 22px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 8px 24px rgba(0, 102, 204, 0.22);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.quick-report:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(0, 102, 204, 0.28);
}
.quick-report:active {
  transform: translateY(0);
}
.quick-report-icon {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}
.quick-report-text {
  flex: 1;
  min-width: 0;
}
.quick-report-title {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin-bottom: 2px;
}
.quick-report-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.82);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.quick-report-arrow {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
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
  -webkit-tap-highlight-color: transparent;
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

@media (max-width: 480px) {
  .home {
    padding: 4px 0 32px;
  }
  .home-hero {
    margin-bottom: 20px;
  }
  .home-title {
    font-size: 22px;
  }
  .home-sub {
    font-size: 14px;
  }
  .quick-report {
    padding: 14px 16px;
    margin-bottom: 16px;
    gap: 12px;
  }
  .quick-report-icon {
    width: 44px;
    height: 44px;
    font-size: 22px;
    border-radius: 12px;
  }
  .quick-report-title {
    font-size: 17px;
  }
  .quick-report-desc {
    font-size: 12px;
    white-space: normal;
  }
  .quick-report-arrow {
    width: 30px;
    height: 30px;
    font-size: 15px;
  }
  .home-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .home-card {
    padding: 14px;
    border-radius: 14px;
  }
  .card-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
    border-radius: 10px;
    margin-bottom: 10px;
  }
  .card-title {
    font-size: 15px;
  }
  .card-desc {
    font-size: 12px;
  }
}
</style>
