/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:43:42
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:43:43
 * @FilePath: \feishu-work\web\src\api\report.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import request from './request';

export const getReports = (params?: any) => request.get<any, any>('/reports', { params });
export const getReport = (id: number) => request.get<any, any>(`/reports/${id}`);
export const getReportQuota = (reportDate: string) => request.get<any, any>('/reports/quota', { params: { reportDate } });
export const createReport = (data: any) => request.post<any, any>('/reports', data);
export const updateReport = (id: number, data: any) => request.put<any, any>(`/reports/${id}`, data);
export const deleteReport = (id: number) => request.delete<any, any>(`/reports/${id}`);
export const isHoliday = (date: string) => request.get<any, any>('/calendar/is-holiday', { params: { date } });
