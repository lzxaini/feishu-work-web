/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:38:49
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:38:50
 * @FilePath: \feishu-work\server\src\modules\user\user.service.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { FeishuAuthService } from '../../feishu/feishu-auth.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private feishuAuth: FeishuAuthService,
  ) {}

  /** 用户列表（缓存表）；systemEnabledOnly=true 时仅返回已启用系统用户 */
  async list(keyword?: string, page = 1, pageSize = 20, systemEnabledOnly = false) {
    const where: any = { enabled: 1 };
    if (systemEnabledOnly) where.systemEnabled = 1;
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { mobile: { contains: keyword } },
        { userId: { contains: keyword } },
        { email: { contains: keyword } },
      ];
    }
    const [total, items] = await this.prisma.$transaction([
      this.prisma.feishuUserCache.count({ where }),
      this.prisma.feishuUserCache.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { total, page, pageSize, items };
  }

  /** 同步通讯录 */
  sync() {
    return this.feishuAuth.syncUsers();
  }

  /** 设置某用户是否允许节假日报工 */
  async setHolidayEnabled(openId: string, enabled: boolean) {
    const user = await this.prisma.feishuUserCache.findUnique({ where: { openId } });
    if (!user) throw new NotFoundException('用户不存在');
    return this.prisma.feishuUserCache.update({
      where: { openId },
      data: { holidayReportEnabled: enabled ? 1 : 0 },
    });
  }

  /** 设置某用户是否启用系统（未启用无法登录使用） */
  async setEnabled(openId: string, enabled: boolean) {
    const user = await this.prisma.feishuUserCache.findUnique({ where: { openId } });
    if (!user) throw new NotFoundException('用户不存在');
    return this.prisma.feishuUserCache.update({
      where: { openId },
      data: { systemEnabled: enabled ? 1 : 0 },
    });
  }
}
