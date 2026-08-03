/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:37:29
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:37:29
 * @FilePath: \feishu-work\server\src\feishu\feishu.module.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Global, Module } from '@nestjs/common';
import { FeishuService } from './feishu.service';
import { FeishuAuthService } from './feishu-auth.service';
import { FeishuApprovalService } from './feishu-approval.service';
import { FeishuMessageService } from './feishu-message.service';

// 飞书开放平台封装（全局）
@Global()
@Module({
  providers: [FeishuService, FeishuAuthService, FeishuApprovalService, FeishuMessageService],
  exports: [FeishuService, FeishuAuthService, FeishuApprovalService, FeishuMessageService],
})
export class FeishuModule {}
