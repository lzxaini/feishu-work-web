/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:39:51
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:39:52
 * @FilePath: \feishu-work\server\src\modules\calendar\calendar.service.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { DAY_TYPE } from '../../common/constants';

/**
 * 节假日/日历服务
 * 默认：周一~周五=工作日，周六/周日=节假日；calendar_rule 存例外
 * 日期统一用 UTC 午夜（new Date('YYYY-MM-DD')）避免 MySQL DATE 时区偏移
 */
@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

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

  /** 规则列表（calDate 统一规范化为 YYYY-MM-DD 字符串，避免 MySQL DATE 列时区读回偏移显示错一天） */
  async listRules() {
    const rules = await this.prisma.calendarRule.findMany({ orderBy: { calDate: 'asc' } });
    return rules.map((r) => ({ ...r, calDate: this.formatDate(r.calDate) }));
  }

  /** 把 DB 读回的 Date 用本地时区格式化为 YYYY-MM-DD（本地时区与 MySQL 会话时区一致时可还原正确日期） */
  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
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

  /** 读取配置的节假日 JSON 链接（SystemConfig.calendar_json_url） */
  private async getConfigUrl(): Promise<string> {
    const cfg = await this.prisma.systemConfig.findUnique({ where: { configKey: 'calendar_json_url' } });
    return cfg?.configValue || '';
  }

  /**
   * 从配置的 JSON 链接同步节假日（幂等 upsert，只增不删）
   * overrideUrl 优先；未配置则 skipped=true（不抛错，便于定时任务）
   */
  async syncFromConfig(overrideUrl?: string): Promise<{
    skipped: boolean;
    message?: string;
    total: number;
    holiday: number;
    adjustWorkday: number;
    failedUrls: number;
  }> {
    const url = overrideUrl || (await this.getConfigUrl());
    if (!url) {
      return { skipped: true, message: '未配置节假日 JSON 链接', total: 0, holiday: 0, adjustWorkday: 0, failedUrls: 0 };
    }
    const res = await this.fetchAndSync(url);
    return { ...res, skipped: false };
  }

  /**
   * 拉取节假日 JSON 并增量同步到 calendar_rule
   * 格式参考 https://unpkg.com/holiday-calendar/data/CN/2025.json
   * - public_holiday → 法定节假日（dayType=1）
   * - transfer_workday → 调休上班日（dayType=2）
   * 链接支持 {year} 占位符，自动展开为今年+明年
   */
  async fetchAndSync(url: string): Promise<{
    total: number;
    holiday: number;
    adjustWorkday: number;
    failedUrls: number;
  }> {
    const urls = this.expandYearUrls(url);
    let holiday = 0;
    let adjustWorkday = 0;
    let failedUrls = 0;

    for (const u of urls) {
      try {
        const res = await axios.get(u, { timeout: 15000 });
        const dates = res.data?.dates || [];
        for (const item of dates) {
          if (!item?.date) continue;
          let dayType: number;
          if (item.type === 'public_holiday') {
            dayType = DAY_TYPE.HOLIDAY;
            holiday++;
          } else if (item.type === 'transfer_workday') {
            dayType = DAY_TYPE.ADJUST_WORKDAY;
            adjustWorkday++;
          } else {
            continue;
          }
          const calDate = this.toUtcDate(item.date);
          const name = item.name_cn || item.name || null;
          await this.prisma.calendarRule.upsert({
            where: { calDate },
            update: { dayType, name, source: 'json' },
            create: { calDate, dayType, name, source: 'json' },
          });
        }
      } catch (e: any) {
        failedUrls++;
        this.logger.warn(`节假日 JSON 拉取失败: ${u} - ${e?.message}`);
      }
    }
    return { total: holiday + adjustWorkday, holiday, adjustWorkday, failedUrls };
  }

  /** 展开 {year} 占位符：今年 + 明年；无占位符则原样返回 */
  private expandYearUrls(url: string): string[] {
    if (!url.includes('{year}')) return [url];
    const now = new Date();
    const years = [now.getFullYear(), now.getFullYear() + 1];
    return years.map((y) => url.replace('{year}', String(y)));
  }
}
