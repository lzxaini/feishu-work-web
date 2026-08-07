/*
 * @Author: 17630921248 1245634367@qq.com
 * @Date: 2026-08-07 17:15:15
 * @LastEditors: 17630921248 1245634367@qq.com
 * @LastEditTime: 2026-08-07 17:15:16
 * @FilePath: \feishu-work-web\server\src\jobs\report-remind.job.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-07 17:00:00
 * @FilePath: \feishu-work-web\server\src\jobs\report-remind.job.ts
 * @Description: 报工提醒定时任务：每天早上 8 点，若昨天为工作日，提醒昨天未报工或普通时长不足上限的启用系统用户
 */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StatsService } from '../modules/stats/stats.service';
import { CalendarService } from '../modules/calendar/calendar.service';

/**
 * 每天 08:00 触发；在方法内判断「昨天是否为工作日」：
 * - 昨天为节假日/周末（含法定节假日）→ 跳过（无需报工，不提醒）
 * - 昨天为工作日（含调休上班日）→ 提醒昨天未报工或普通时长不足的用户
 */
@Injectable()
export class ReportRemindJob {
  private readonly logger = new Logger(ReportRemindJob.name);

  constructor(
    private statsService: StatsService,
    private calendarService: CalendarService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async remindYesterday() {
    const dateStr = this.yesterdayStr();
    try {
      // 昨天为节假日/周末 → 无需报工，跳过
      if (await this.calendarService.isHoliday(dateStr)) {
        this.logger.log(`昨天 ${dateStr} 为节假日/周末，跳过报工提醒`);
        return;
      }
      const res = await this.statsService.remindUnfinishedWorkday(dateStr);
      this.logger.log(`报工提醒完成: ${JSON.stringify(res)}`);
    } catch (e) {
      this.logger.error(`报工提醒任务失败: ${(e as Error).message}`);
    }
  }

  private yesterdayStr(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }
}
