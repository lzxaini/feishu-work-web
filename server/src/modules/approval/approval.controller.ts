/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:40:54
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:40:54
 * @FilePath: \feishu-work\server\src\modules\approval\approval.controller.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Body, Controller, Post } from '@nestjs/common';
import { ApprovalService } from './approval.service';

@Controller('internal/feishu')
export class ApprovalController {
  constructor(private approvalService: ApprovalService) {}

  /**
   * 飞书审批事件订阅地址
   * 需在开发者后台 → 事件订阅 配置为 HTTPS 回调
   */
  @Post('approval-callback')
  handleCallback(@Body() body: any) {
    return this.approvalService.handleCallback(body);
  }
}

// 手动对账入口（也可由定时任务调用）
@Controller('internal/approvals')
export class ApprovalInternalController {
  constructor(private approvalService: ApprovalService) {}

  @Post('reconcile')
  reconcile() {
    return this.approvalService.reconcilePending();
  }
}
