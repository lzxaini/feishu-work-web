/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:43:45
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:43:46
 * @FilePath: \feishu-work\web\src\api\calendar.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import request from './request';

export const getCalendarRules = () => request.get<any, any>('/calendar/rules');
export const createCalendarRule = (data: { calDate: string; dayType: number; name?: string }) =>
  request.post<any, any>('/calendar/rules', data);
export const deleteCalendarRule = (id: number) => request.delete<any, any>(`/calendar/rules/${id}`);
export const syncCalendar = () => request.post<any, any>('/calendar/sync');
