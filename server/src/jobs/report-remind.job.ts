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
 * @Description: 报工提醒定时任务：按系统设置（开关 + 时间）触发，若昨天为工作日，提醒昨天未报工或普通时长不足上限的启用系统用户
 *  配置项：report_remind_enabled（1开启/0关闭，默认1）、report_remind_time（HH:mm，默认08:00）
 */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { StatsService } from '../modules/stats/stats.service';
import { CalendarService } from '../modules/calendar/calendar.service';

/**
 * 每分钟触发一次，在方法内判断：
 * 1. 系统设置开关是否开启
 * 2. 当前时间是否等于配置的提醒时间（默认 08:00）
 * 3. 昨天是否为工作日（节假日/周末跳过）
 * 命中后才执行提醒；配置修改即时生效，无需重启。
 */
@Injectable()
export class ReportRemindJob {
  private readonly logger = new Logger(ReportRemindJob.name);

  constructor(
    private prisma: PrismaService,
    private statsService: StatsService,
    private calendarService: CalendarService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async tick() {
    try {
      const cfg = await this.readConfig();
      if (cfg.enabled !== '1') return; // 开关关闭
      if (cfg.time !== this.currentHHMM()) return; // 未到配置的提醒时间
      await this.remindYesterday();
    } catch (e) {
      this.logger.error(`报工提醒任务失败: ${(e as Error).message}`);
    }
  }

  /** 读取系统设置中的开关与提醒时间（默认开启 08:00） */
  private async readConfig(): Promise<{ enabled: string; time: string }> {
    const cfg = await this.prisma.systemConfig.findMany({
      where: { configKey: { in: ['report_remind_enabled', 'report_remind_time'] } },
    });
    const map: Record<string, string> = {};
    for (const c of cfg) map[c.configKey] = c.configValue || '';
    return {
      enabled: map['report_remind_enabled'] || '1',
      time: /^\d{2}:\d{2}$/.test(map['report_remind_time'] || '') ? map['report_remind_time'] : '08:00',
    };
  }

  private currentHHMM(): string {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  /** 提醒昨天未报工/普通时长不足的用户（昨天为节假日/周末则跳过） */
  private async remindYesterday() {
    const dateStr = this.yesterdayStr();
    // 昨天为节假日/周末 → 无需报工，跳过
    if (await this.calendarService.isHoliday(dateStr)) {
      this.logger.log(`昨天 ${dateStr} 为节假日/周末，跳过报工提醒`);
      return;
    }
    const res = await this.statsService.remindUnfinishedWorkday(dateStr);
    this.logger.log(`报工提醒完成: ${JSON.stringify(res)}`);
  }

  private yesterdayStr(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }
}
