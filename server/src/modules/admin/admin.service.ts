/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:41:18
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:41:19
 * @FilePath: \feishu-work\server\src\modules\admin\admin.service.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /** 管理员列表 */
  async list() {
    return this.prisma.admin.findMany({ orderBy: { createdAt: 'desc' } });
  }

  /** 新增管理员（openId 需为飞书用户） */
  async add(openId: string) {
    const user = await this.prisma.feishuUserCache.findUnique({ where: { openId } });
    return this.prisma.admin.upsert({
      where: { openId },
      update: { userName: user?.name ?? undefined },
      create: { openId, userName: user?.name || null },
    });
  }

  /** 移除管理员 */
  async remove(openId: string) {
    return this.prisma.admin.delete({ where: { openId } });
  }

  /** 读取系统配置（key-value 对象） */
  async getConfig() {
    const list = await this.prisma.systemConfig.findMany();
    const map: Record<string, string> = {};
    for (const item of list) map[item.configKey] = item.configValue || '';
    return map;
  }

  /** 写入系统配置 */
  async setConfig(configKey: string, configValue: string) {
    return this.prisma.systemConfig.upsert({
      where: { configKey },
      update: { configValue },
      create: { configKey, configValue },
    });
  }
}
