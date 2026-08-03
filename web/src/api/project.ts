/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:43:40
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:43:41
 * @FilePath: \feishu-work\web\src\api\project.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import request from './request';

export const getProjects = (params?: any) => request.get<any, any>('/projects', { params });
export const getProject = (id: number) => request.get<any, any>(`/projects/${id}`);
export const createProject = (data: any) => request.post<any, any>('/projects', data);
export const updateProject = (id: number, data: any) => request.put<any, any>(`/projects/${id}`, data);
export const deleteProject = (id: number) => request.delete<any, any>(`/projects/${id}`);
export const getUsers = (params?: any) => request.get<any, any>('/users', { params });
