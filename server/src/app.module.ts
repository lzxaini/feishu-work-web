/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:36:44
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:36:45
 * @FilePath: \feishu-work\server\src\app.module.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { FeishuModule } from './feishu/feishu.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProjectModule } from './modules/project/project.module';
import { ReportModule } from './modules/report/report.module';
import { ApprovalModule } from './modules/approval/approval.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { NotifyModule } from './modules/notify/notify.module';
import { AdminModule } from './modules/admin/admin.module';
import { StatsModule } from './modules/stats/stats.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    FeishuModule,
    AuthModule,
    UserModule,
    ProjectModule,
    ReportModule,
    ApprovalModule,
    CalendarModule,
    NotifyModule,
    AdminModule,
    StatsModule,
    JobsModule,
  ],
})
export class AppModule {}
