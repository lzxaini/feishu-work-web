/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:40:54
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:40:54
 * @FilePath: \feishu-work\server\src\modules\approval\approval.controller.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApprovalService } from './approval.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

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

/** 系统内审批：待审批列表 + 通过 + 驳回（仅项目负责人/管理员） */
@Controller('approvals')
@UseGuards(JwtAuthGuard)
export class ApprovalManageController {
  constructor(private approvalService: ApprovalService) {}

  @Get('pending')
  pending(@CurrentUser() user: JwtUser) {
    return this.approvalService.listPending(user);
  }

  @Post(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtUser) {
    return this.approvalService.approve(id, user);
  }

  @Post(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number, @Body() body: { reason?: string }, @CurrentUser() user: JwtUser) {
    return this.approvalService.reject(id, user, body?.reason);
  }
}
