/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:36:46
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:36:47
 * @FilePath: \feishu-work\server\src\prisma\prisma.module.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
