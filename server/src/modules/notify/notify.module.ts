/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:40:56
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:40:57
 * @FilePath: \feishu-work\server\src\modules\notify\notify.module.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Module } from '@nestjs/common';
import { NotifyController } from './notify.controller';
import { NotifyService } from './notify.service';

@Module({
  controllers: [NotifyController],
  providers: [NotifyService],
  exports: [NotifyService],
})
export class NotifyModule {}
