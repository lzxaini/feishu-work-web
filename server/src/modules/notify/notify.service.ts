/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:40:58
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:40:59
 * @FilePath: \feishu-work\server\src\modules\notify\notify.service.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FeishuMessageService } from '../../feishu/feishu-message.service';

/**
 * 消息通知：封装发送 + 记录 message_log（失败可重试）
 */
@Injectable()
export class NotifyService {
  constructor(
    private prisma: PrismaService,
    private feishuMessage: FeishuMessageService,
  ) {}

  /** 发送文本并记录 */
  async sendText(receiverOpenId: string, text: string, workReportId?: number) {
    try {
      await this.feishuMessage.sendText(receiverOpenId, text);
      await this.log(receiverOpenId, 'text', text, workReportId, 1);
      return { success: true };
    } catch (e) {
      await this.log(receiverOpenId, 'text', text, workReportId, 2, (e as Error).message);
      return { success: false, error: (e as Error).message };
    }
  }

  /** 发送卡片并记录 */
  async sendCard(receiverOpenId: string, card: Record<string, unknown>, workReportId?: number) {
    try {
      await this.feishuMessage.sendCard(receiverOpenId, card);
      await this.log(receiverOpenId, 'interactive', JSON.stringify(card), workReportId, 1);
      return { success: true };
    } catch (e) {
      await this.log(receiverOpenId, 'interactive', JSON.stringify(card), workReportId, 2, (e as Error).message);
      return { success: false, error: (e as Error).message };
    }
  }

  private async log(receiverOpenId: string, msgType: string, content: string, workReportId: number | undefined, sendStatus: number, error?: string) {
    await this.prisma.messageLog.create({
      data: { receiverOpenId, msgType, content, workReportId: workReportId ?? null, sendStatus, error },
    });
  }
}
