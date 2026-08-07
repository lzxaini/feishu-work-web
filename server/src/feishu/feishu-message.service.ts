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

  /** 发送带跳转按钮的卡片消息（点击按钮打开系统页面） */
  async sendActionCard(
    openId: string,
    opts: {
      title: string;
      template?: 'blue' | 'green' | 'orange' | 'red' | 'grey';
      lines: string[]; // markdown 内容行
      buttonText: string;
      url: string; // 为空则不渲染跳转按钮
    },
  ) {
    const elements: any[] = [{ tag: 'div', text: { tag: 'lark_md', content: opts.lines.join('\n') } }];
    if (opts.url) {
      elements.push({
        tag: 'action',
        actions: [{ tag: 'button', text: { tag: 'plain_text', content: opts.buttonText }, type: 'primary', url: opts.url }],
      });
    }
    return this.sendCard(openId, {
      config: { wide_screen_mode: true },
      header: { title: { tag: 'plain_text', content: opts.title }, template: opts.template || 'blue' },
      elements,
    });
  }

  /**
   * 生成飞书 Applink：在飞书端内打开网页应用的指定页面（自动免登，不跳外部浏览器）
   * 协议：https://applink.feishu.cn/client/web_app/open
   * 说明：path 拼接在开发者后台配置的网页应用主页地址上，无需依赖 APP_WEB_URL
   */
  buildWebAppLink(path: string, mode: 'appCenter' | 'window' | 'sidebar' = 'appCenter'): string {
    const appId = this.feishu.appId;
    return `https://applink.feishu.cn/client/web_app/open?appId=${encodeURIComponent(appId)}&mode=${mode}&path=${encodeURIComponent(path)}`;
  }
}
