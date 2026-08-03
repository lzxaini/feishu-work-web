/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:40:01
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:40:01
 * @FilePath: \feishu-work\server\src\modules\report\report.module.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { CalendarModule } from '../calendar/calendar.module';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [CalendarModule, ProjectModule],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
