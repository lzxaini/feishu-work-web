/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:41:26
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:41:27
 * @FilePath: \feishu-work\server\src\jobs\approval-sync.job.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApprovalService } from '../modules/approval/approval.service';

/**
 * 审批对账：每 5 分钟拉取审批中实例状态，防丢事件
 */
@Injectable()
export class ApprovalSyncJob {
  private readonly logger = new Logger(ApprovalSyncJob.name);

  constructor(private approvalService: ApprovalService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async reconcile() {
    try {
      const res = await this.approvalService.reconcilePending();
      this.logger.log(`审批对账完成: ${res.checked} 条`);
    } catch (e) {
      this.logger.error(`审批对账失败: ${(e as Error).message}`);
    }
  }
}
