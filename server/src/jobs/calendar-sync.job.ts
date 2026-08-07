/*
 * @Author: 17630921248 1245634367@qq.com
 * @Date: 2026-08-07 09:25:49
 * @LastEditors: 17630921248 1245634367@qq.com
 * @LastEditTime: 2026-08-07 09:25:50
 * @FilePath: \feishu-work-web\server\src\jobs\calendar-sync.job.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-07
 * @Description: 节假日 JSON 自动同步（每周一次，幂等）
 * 微信：lizx2066
 */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CalendarService } from '../modules/calendar/calendar.service';

/**
 * 节假日同步：每周从配置的 JSON 链接（calendar_json_url）拉取并增量同步
 * 已同步的日期 upsert 不重复，能及时拿到官方节假日公告
 */
@Injectable()
export class CalendarSyncJob {
  private readonly logger = new Logger(CalendarSyncJob.name);

  constructor(private calendar: CalendarService) {}

  @Cron(CronExpression.EVERY_WEEK)
  async sync() {
    try {
      const res = await this.calendar.syncFromConfig();
      if (res.skipped) {
        this.logger.log('节假日同步跳过：未配置 JSON 链接');
        return;
      }
      this.logger.log(
        `节假日定时同步完成: 共 ${res.total} 条（法定 ${res.holiday} / 调休 ${res.adjustWorkday}），失败链接 ${res.failedUrls} 个`,
      );
    } catch (e: any) {
      this.logger.error(`节假日定时同步失败: ${e?.message}`);
    }
  }
}
