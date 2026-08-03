/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:39:51
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:39:52
 * @FilePath: \feishu-work\server\src\modules\calendar\calendar.service.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DAY_TYPE } from '../../common/constants';

/**
 * 节假日/日历服务
 * 默认：周一~周五=工作日，周六/周日=节假日；calendar_rule 存例外
 * 日期统一用 UTC 午夜（new Date('YYYY-MM-DD')）避免 MySQL DATE 时区偏移
 */
@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  private toUtcDate(d: Date | string): Date {
    if (typeof d === 'string') return new Date(d); // 'YYYY-MM-DD' → UTC midnight
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }

  /** 判断某日是否节假日 */
  async isHoliday(date: Date | string): Promise<boolean> {
    const d = this.toUtcDate(date);
    const rule = await this.prisma.calendarRule.findUnique({ where: { calDate: d } });
    if (rule) {
      if (rule.dayType === DAY_TYPE.HOLIDAY) return true;
      if (rule.dayType === DAY_TYPE.WORKDAY || rule.dayType === DAY_TYPE.ADJUST_WORKDAY) return false;
    }
    const day = d.getUTCDay();
    return day === 0 || day === 6; // 周末为节假日
  }

  /** 规则列表 */
  async listRules() {
    return this.prisma.calendarRule.findMany({ orderBy: { calDate: 'asc' } });
  }

  /** 新增例外规则 */
  async createRule(dto: { calDate: string; dayType: number; name?: string }) {
    const calDate = this.toUtcDate(dto.calDate);
    return this.prisma.calendarRule.upsert({
      where: { calDate },
      update: { dayType: dto.dayType, name: dto.name },
      create: { calDate, dayType: dto.dayType, name: dto.name },
    });
  }

  /** 删除例外规则 */
  async removeRule(id: number) {
    return this.prisma.calendarRule.delete({ where: { id } });
  }
}
