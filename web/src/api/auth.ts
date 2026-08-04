/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:43:37
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:43:38
 * @FilePath: \feishu-work\web\src\api\auth.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import request from './request';

export const login = (code: string) =>
  request.post<any, { token: string; user: any }>('/auth/feishu/login', { code });

/** 临时登录（仅本地调试，后端 DEV_LOGIN_ENABLED=1 时可用） */
export const devLogin = () =>
  request.post<any, { token: string; user: any }>('/auth/dev/login');

export const getMe = () => request.get<any, any>('/auth/me');
