/*
 * @Author: 17630921248 1245634367@qq.com
 * @Date: 2026-08-04 15:43:50
 * @LastEditors: 17630921248 1245634367@qq.com
 * @LastEditTime: 2026-08-04 15:43:50
 * @FilePath: \feishu-work-web\web\src\api\approval.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import request from './request';

/** 系统内审批：待审批报工列表 */
export const getPendingApprovals = () => request.get<any, any>('/approvals/pending');
/** 审批通过 */
export const approveReport = (id: number) => request.post<any, any>(`/approvals/${id}/approve`);
/** 审批驳回 */
export const rejectReport = (id: number, reason?: string) => request.post<any, any>(`/approvals/${id}/reject`, { reason });
