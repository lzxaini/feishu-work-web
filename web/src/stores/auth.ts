/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:43:32
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:43:33
 * @FilePath: \feishu-work\web\src\stores\auth.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { defineStore } from 'pinia';
import { login, devLogin, getMe } from '../api/auth';

export interface UserInfo {
  openId: string;
  name: string;
  avatarUrl?: string;
  isAdmin: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: null as UserInfo | null,
  }),
  getters: {
    isLoggedIn: (s) => !!s.token,
    isAdmin: (s) => !!s.user?.isAdmin,
  },
  actions: {
    async loginByCode(code: string) {
      const res = await login(code);
      this.token = res.token;
      this.user = res.user;
      localStorage.setItem('token', res.token);
    },
    /** 临时登录（仅本地调试） */
    async loginDev() {
      const res = await devLogin();
      this.token = res.token;
      this.user = res.user;
      localStorage.setItem('token', res.token);
    },
    async fetchMe() {
      if (!this.token) return;
      this.user = await getMe();
    },
    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('token');
    },
  },
});
