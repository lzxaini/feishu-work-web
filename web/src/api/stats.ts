/*
 * @Author: 17630921248 1245634367@qq.com
 * @Date: 2026-08-07 16:48:10
 * @LastEditors: 17630921248 1245634367@qq.com
 * @LastEditTime: 2026-08-07 16:48:11
 * @FilePath: \feishu-work-web\web\src\api\stats.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-07 16:00:00
 * @FilePath: \feishu-work-web\web\src\api\stats.ts
 * @Description: 报工统计接口
 */
import request from './request';

/** 报工统计（按用户×日期汇总，支持 startDate/endDate/openId 筛选） */
export const getStatsDaily = (params?: any) => request.get<any, any>('/stats/daily', { params });

/** 推送报工提醒卡片（date 指定日期，openId 为空则提醒全部启用用户） */
export const sendReportRemind = (data?: any) => request.post<any, any>('/stats/remind', data);
