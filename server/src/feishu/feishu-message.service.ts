/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:37:38
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:37:38
 * @FilePath: \feishu-work\server\src\feishu\feishu-message.service.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Injectable } from '@nestjs/common';
import { FeishuService } from './feishu.service';

/**
 * 飞书消息：文本/卡片（审批提醒走飞书）
 * 对应 docs/04 第六节
 */
@Injectable()
export class FeishuMessageService {
  constructor(private feishu: FeishuService) {}

  /** 发送文本消息 */
  async sendText(openId: string, text: string) {
    return this.feishu.request('post', '/im/v1/messages?receive_id_type=open_id', {
      receive_id: openId,
      msg_type: 'text',
      content: JSON.stringify({ text }),
    });
  }

  /** 发送卡片消息 */
  async sendCard(openId: string, card: Record<string, unknown>) {
    return this.feishu.request('post', '/im/v1/messages?receive_id_type=open_id', {
      receive_id: openId,
      msg_type: 'interactive',
      content: JSON.stringify(card),
    });
  }
}
