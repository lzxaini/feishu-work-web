/*
 * @Author: 17630921248 1245634367@qq.com
 * @Date: 2026-08-07 16:48:02
 * @LastEditors: 17630921248 1245634367@qq.com
 * @LastEditTime: 2026-08-07 17:06:49
 * @FilePath: \feishu-work-web\server\src\modules\stats\stats.service.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-07 16:00:00
 * @LastEditors: lzx 1245634367@qq.com
 * @FilePath: \feishu-work-web\server\src\modules\stats\stats.service.ts
 * @Description: 报工统计服务：按用户×日期统计启用系统用户的报工时长；推送报工提醒卡片
 */
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FeishuMessageService } from '../../feishu/feishu-message.service';
import { REPORT_STATUS } from '../../common/constants';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(
    private prisma: PrismaService,
    private feishuMessage: FeishuMessageService,
  ) {}

  /** 已启用系统的用户（仅 systemEnabled=1；未启用系统的用户不计入统计、不推送提醒） */
  private async enabledUsers() {
    return this.prisma.feishuUserCache.findMany({
      where: { enabled: 1, systemEnabled: 1 },
      orderBy: { name: 'asc' },
      select: { openId: true, name: true, departmentName: true },
    });
  }

  /**
   * 报工统计（管理员）
   * 汇总启用系统用户每天的总报工时长（普通/加班/合计），仅统计「审批中/已通过」的有效报工
   * 支持按 用户(openId) 和 日期区间(startDate/endDate) 筛选
   */
  async daily(query: { startDate?: string; endDate?: string; openId?: string }) {
    const users = await this.enabledUsers();
    const openIds = users.map((u) => u.openId);
    const nameMap = new Map(users.map((u) => [u.openId, u]));

    const where: any = {
      deleted: 0,
      status: { in: [REPORT_STATUS.PENDING, REPORT_STATUS.APPROVED] },
      userOpenId: { in: openIds },
    };
    if (query.openId) where.userOpenId = query.openId;
    if (query.startDate || query.endDate) {
      const range: any = {};
      if (query.startDate) range.gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setDate(end.getDate() + 1); // 下一天 00:00，用 lt 排除时区偏移
        range.lt = end;
      }
      where.reportDate = range;
    }

    // 按 用户 × 日期 汇总
    const grouped = await this.prisma.workReport.groupBy({
      by: ['userOpenId', 'reportDate'],
      where,
      _sum: { normalHours: true, overtimeHours: true, totalHours: true },
      _count: { id: true },
      orderBy: [{ reportDate: 'asc' }, { userOpenId: 'asc' }],
    });

    const rows = grouped.map((g) => {
      const u = nameMap.get(g.userOpenId);
      return {
        openId: g.userOpenId,
        name: u?.name || g.userOpenId,
        departmentName: u?.departmentName || '',
        reportDate: g.reportDate.toISOString().slice(0, 10),
        normalHours: Number(g._sum.normalHours || 0),
        overtimeHours: Number(g._sum.overtimeHours || 0),
        totalHours: Number(g._sum.totalHours || 0),
        reportCount: g._count.id,
      };
    });

    // 按用户汇总（跨日期）：所有已启用系统的用户都计入，没有报工记录的显示为 0
    const userMap = new Map<string, any>();
    for (const u of users) {
      userMap.set(u.openId, {
        openId: u.openId,
        name: u.name,
        departmentName: u.departmentName || '',
        normalHours: 0,
        overtimeHours: 0,
        totalHours: 0,
        reportCount: 0,
        days: 0,
      });
    }
    for (const r of rows) {
      const cur = userMap.get(r.openId);
      if (!cur) continue;
      cur.normalHours += r.normalHours;
      cur.overtimeHours += r.overtimeHours;
      cur.totalHours += r.totalHours;
      cur.reportCount += r.reportCount;
      cur.days += 1;
      userMap.set(r.openId, cur);
    }
    const userTotals = [...userMap.values()].sort((a, b) => b.totalHours - a.totalHours);

    // 按日期汇总（跨用户）
    const dateMap = new Map<string, any>();
    for (const r of rows) {
      const cur = dateMap.get(r.reportDate) || { date: r.reportDate, totalHours: 0, reportCount: 0, reportedUsers: 0 };
      cur.totalHours += r.totalHours;
      cur.reportCount += r.reportCount;
      cur.reportedUsers += 1;
      dateMap.set(r.reportDate, cur);
    }
    const dateTotals = [...dateMap.values()].sort((a, b) => a.date.localeCompare(b.date));

    return {
      users: users.map((u) => ({ openId: u.openId, name: u.name, departmentName: u.departmentName })),
      rows,
      userTotals,
      dateTotals,
      summary: {
        totalHours: rows.reduce((s, r) => s + r.totalHours, 0),
        reportCount: rows.reduce((s, r) => s + r.reportCount, 0),
        reportedUsers: userTotals.filter((u) => u.reportCount > 0).length,
      },
    };
  }

  /**
   * 提醒报工（管理员）：给所有已启用系统的用户推送报工提醒卡片
   * openId 为空 → 提醒全部启用用户；否则仅提醒该用户
   * force=true → 使用「不足 8 小时」文案（统计页表格按钮）
   */
  async remind(body: { date?: string; openId?: string; force?: boolean }) {
    const dateStr = body?.date || this.todayStr();
    const start = new Date(dateStr);
    if (isNaN(start.getTime())) throw new BadRequestException('日期格式不正确');

    // 目标用户：指定用户 或 全部启用用户
    let users = await this.enabledUsers();
    if (body?.openId) {
      const target = users.find((u) => u.openId === body.openId);
      if (!target) throw new BadRequestException('用户不存在或未启用系统');
      users = [target];
    }

    // 提醒全部启用系统用户（不跳过当天已报工的用户，保证「提醒所有已启用用户」）
    const targets = users;

    // 卡片标题：今日 → 「今日报工提醒」；非今日 → 显示具体日期
    const cardTitle = dateStr === this.todayStr() ? '⏰ 今日报工提醒' : `⏰ ${dateStr} 报工提醒`;

    // 卡片文案：强制提醒（针对普通时长不足 8h）与常规提醒区分
    const lines = body?.force
      ? ['你的普通报工时长还未满 8 小时，记得及时补报哦～']
      : [`请记得及时完成 ${dateStr} 的报工哦～`];

    let sent = 0;
    let failed = 0;
    for (const u of targets) {
      try {
        await this.feishuMessage.sendActionCard(u.openId, {
          title: cardTitle,
          template: 'blue',
          lines,
          buttonText: '去报工',
          url: this.feishuMessage.buildWebAppLink('/reports/new'),
        });
        sent++;
        await this.logMessage(u.openId, dateStr, 1);
      } catch (e: any) {
        failed++;
        this.logger.warn(`提醒报工发送失败 ${u.name}: ${e?.message}`);
        await this.logMessage(u.openId, dateStr, 2, String(e?.message || e));
      }
    }

    return {
      date: dateStr,
      total: users.length,
      alreadyReported: users.length - targets.length,
      sent,
      failed,
      recipients: targets.map((u) => u.name),
    };
  }

  /** 定时任务：提醒某工作日未报工或普通时长不足上限的启用系统用户（用于昨天提醒） */
  async remindUnfinishedWorkday(dateStr: string) {
    const start = new Date(dateStr);
    if (isNaN(start.getTime())) throw new BadRequestException('日期格式不正确');
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const users = await this.enabledUsers();
    const limit = await this.getWorkHoursLimit();

    // 该日期每位用户的普通时长合计（审批中/已通过视为有效报工）
    const grouped = await this.prisma.workReport.groupBy({
      by: ['userOpenId'],
      where: {
        userOpenId: { in: users.map((u) => u.openId) },
        reportDate: { gte: start, lt: end },
        deleted: 0,
        status: { in: [REPORT_STATUS.PENDING, REPORT_STATUS.APPROVED] },
      },
      _sum: { normalHours: true },
    });
    const hoursMap = new Map(grouped.map((g) => [g.userOpenId, Number(g._sum.normalHours || 0)]));

    // 目标：未报工（无记录）或 普通时长 < 上限
    const targets = users.filter((u) => (hoursMap.get(u.openId) || 0) < limit);

    const cardTitle = `⏰ ${dateStr} 报工提醒`;
    let sent = 0;
    let failed = 0;
    for (const u of targets) {
      const reported = hoursMap.has(u.openId);
      const hours = hoursMap.get(u.openId) || 0;
      const line1 = reported ? `昨天（${dateStr}）你的普通报工时长共 ${hours} 小时` : `昨天（${dateStr}）你还没有提交报工`;
      try {
        await this.feishuMessage.sendActionCard(u.openId, {
          title: cardTitle,
          template: 'orange',
          lines: [line1, `工作日报工普通时长上限为 ${limit} 小时，记得及时补报哦～`],
          buttonText: '去报工',
          url: this.feishuMessage.buildWebAppLink('/reports/new'),
        });
        sent++;
        await this.logMessage(u.openId, dateStr, 1);
      } catch (e: any) {
        failed++;
        this.logger.warn(`定时提醒发送失败 ${u.name}: ${e?.message}`);
        await this.logMessage(u.openId, dateStr, 2, String(e?.message || e));
      }
    }

    return {
      date: dateStr,
      limit,
      total: users.length,
      targets: targets.length,
      sent,
      failed,
      recipients: targets.map((u) => u.name),
    };
  }

  /** 工作日普通时长上限（SystemConfig 优先，默认 8） */
  private async getWorkHoursLimit(): Promise<number> {
    const cfg = await this.prisma.systemConfig.findUnique({ where: { configKey: 'working_hours_limit' } });
    if (cfg?.configValue && Number(cfg.configValue) > 0) return Number(cfg.configValue);
    return 8;
  }

  private async logMessage(receiverOpenId: string, dateStr: string, sendStatus: number, error?: string) {
    try {
      await this.prisma.messageLog.create({
        data: { receiverOpenId, msgType: 'remind', content: `报工提醒 ${dateStr}`, sendStatus, error },
      });
    } catch {
      // 记录失败不影响主流程
    }
  }

  private todayStr(): string {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }
}
