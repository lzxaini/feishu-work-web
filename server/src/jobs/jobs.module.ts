/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:41:24
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:41:24
 * @FilePath: \feishu-work\server\src\jobs\jobs.module.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Module } from '@nestjs/common';
import { ApprovalModule } from '../modules/approval/approval.module';
import { CalendarModule } from '../modules/calendar/calendar.module';
import { StatsModule } from '../modules/stats/stats.module';
import { ApprovalSyncJob } from './approval-sync.job';
import { CalendarSyncJob } from './calendar-sync.job';
import { UserSyncJob } from './user-sync.job';
import { ReportRemindJob } from './report-remind.job';

@Module({
  imports: [ApprovalModule, CalendarModule, StatsModule],
  providers: [ApprovalSyncJob, CalendarSyncJob, UserSyncJob, ReportRemindJob],
})
export class JobsModule {}
