/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:41:00
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:41:01
 * @FilePath: \feishu-work\server\src\modules\notify\notify.controller.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Body, Controller, Post } from '@nestjs/common';
import { NotifyService } from './notify.service';

@Controller('internal/messages')
export class NotifyController {
  constructor(private notifyService: NotifyService) {}

  /** 内部消息发送入口（业务/定时任务调用） */
  @Post('send')
  send(@Body() body: { receiverOpenId: string; text?: string; card?: Record<string, unknown>; workReportId?: number }) {
    if (body.card) return this.notifyService.sendCard(body.receiverOpenId, body.card, body.workReportId);
    return this.notifyService.sendText(body.receiverOpenId, body.text || '', body.workReportId);
  }
}
