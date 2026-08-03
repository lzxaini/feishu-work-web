/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:41:28
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:41:29
 * @FilePath: \feishu-work\server\src\jobs\user-sync.job.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FeishuAuthService } from '../feishu/feishu-auth.service';

/**
 * 通讯录同步：每 6 小时增量同步飞书用户到缓存表
 */
@Injectable()
export class UserSyncJob {
  private readonly logger = new Logger(UserSyncJob.name);

  constructor(private feishuAuth: FeishuAuthService) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async sync() {
    try {
      const res = await this.feishuAuth.syncUsers();
      this.logger.log(`通讯录定时同步完成: ${res.count} 人`);
    } catch (e) {
      this.logger.error(`通讯录同步失败: ${(e as Error).message}`);
    }
  }
}
