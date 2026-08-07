/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:43:29
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:43:30
 * @FilePath: \feishu-work\web\src\router\index.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: () => import('../views/Login.vue') },
    {
      path: '/',
      component: () => import('../components/AppLayout.vue'),
      children: [
        { path: '', name: 'home', component: () => import('../views/HomeView.vue') },
        { path: 'projects', name: 'projects', component: () => import('../views/ProjectList.vue') },
        { path: 'projects/new', name: 'project-new', component: () => import('../views/ProjectForm.vue') },
        { path: 'projects/:id', name: 'project-detail', component: () => import('../views/ProjectDetail.vue') },
        { path: 'projects/:id/edit', name: 'project-edit', component: () => import('../views/ProjectForm.vue') },
        { path: 'reports', name: 'reports', component: () => import('../views/ReportList.vue') },
        { path: 'reports/new', name: 'report-new', component: () => import('../views/ReportForm.vue') },
        { path: 'approvals', name: 'approvals', component: () => import('../views/ApprovalView.vue') },
        { path: 'stats', name: 'stats', component: () => import('../views/StatsView.vue') },
        { path: 'calendar', name: 'calendar', component: () => import('../views/CalendarView.vue') },
        { path: 'settings', name: 'settings', component: () => import('../views/SettingsView.vue') },
      ],
    },
  ],
});

// 登录守卫：未登录跳转登录页（保留 query，供 OAuth 回调携带 code 使用）
router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.name !== 'login' && !auth.token) {
    return { name: 'login', query: to.query };
  }
  return true;
});

export default router;
