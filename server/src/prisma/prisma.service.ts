/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:36:48
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:36:49
 * @FilePath: \feishu-work\server\src\prisma\prisma.service.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
