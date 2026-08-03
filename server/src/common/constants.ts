/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:36:50
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:36:51
 * @FilePath: \feishu-work\server\src\common\constants.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
// 全局常量与状态定义（对应 docs/03 数据表设计）

// 报工状态：work_report.status
export const REPORT_STATUS = {
  PENDING: 1, // 审批中
  APPROVED: 2, // 已通过
  REJECTED: 3, // 已驳回
  CANCELLED: 4, // 已撤销
} as const;

// 审批同步状态：work_report_approval.approval_status
export const APPROVAL_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
  CANCELLED: 3,
} as const;

// 项目状态
export const PROJECT_STATUS = {
  ACTIVE: 1, // 进行中
  PAUSED: 2, // 暂停
  ARCHIVED: 3, // 已归档
} as const;

// 日历类型
export const DAY_TYPE = {
  WORKDAY: 0,
  HOLIDAY: 1, // 法定节假日
  ADJUST_WORKDAY: 2, // 调休上班日（周末上班）
} as const;

// 默认工作日免审批额度（小时）
export const DEFAULT_WORKING_HOURS_LIMIT = 8;
