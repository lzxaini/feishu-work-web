/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:43:47
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:43:48
 * @FilePath: \feishu-work\web\src\api\admin.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import request from './request';

export const getAdminList = () => request.get<any, any>('/admin/list');
export const addAdmin = (openId: string) => request.post<any, any>('/admin', { openId });
export const removeAdmin = (openId: string) => request.delete<any, any>(`/admin/${openId}`);
export const getConfig = () => request.get<any, any>('/config');
export const setConfig = (configKey: string, configValue: string) =>
  request.put<any, any>('/config', { configKey, configValue });
export const syncUsers = () => request.post<any, any>('/users/sync');
export const setUserHolidayEnabled = (openId: string, enabled: boolean) =>
  request.put<any, any>(`/users/${openId}/holiday`, { enabled });
