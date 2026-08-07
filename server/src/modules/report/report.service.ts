/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:40:22
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:40:23
 * @FilePath: \feishu-work\server\src\modules\report\report.service.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as XLSX from 'xlsx';
import { PrismaService } from '../../prisma/prisma.service';
import { CalendarService } from '../calendar/calendar.service';
import { ProjectService } from '../project/project.service';
import { FeishuApprovalService } from '../../feishu/feishu-approval.service';
import { FeishuMessageService } from '../../feishu/feishu-message.service';
import { CreateReportDto, UpdateReportDto } from './dto';
import { DEFAULT_WORKING_HOURS_LIMIT, REPORT_STATUS } from '../../common/constants';
import { JwtUser } from '../../common/decorators/current-user.decorator';

/**
 * 报工核心服务
 * 业务规则（docs/01 4.1）：
 * - 工作日 普通≤8h 且 加班=0 → 免审批直接生效
 * - 工作日 加班>0 → 整单走审批
 * - 工作日 普通>8h → 拦截（请填加班时长）
 * - 节假日 → 一律走审批
 */
@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    private prisma: PrismaService,
    private calendar: CalendarService,
    private projectService: ProjectService,
    private feishuApproval: FeishuApprovalService,
    private feishuMessage: FeishuMessageService,
    private config: ConfigService,
  ) {}

  private async getHoursLimit(): Promise<number> {
    // 允许配置：SystemConfig 表优先（管理员可在系统设置中修改），其次 .env，最后默认 8
    const cfg = await this.prisma.systemConfig.findUnique({ where: { configKey: 'working_hours_limit' } });
    if (cfg?.configValue && Number(cfg.configValue) > 0) return Number(cfg.configValue);
    return Number(this.config.get('WORKING_HOURS_LIMIT') || DEFAULT_WORKING_HOURS_LIMIT);
  }

  /** 节假日是否允许报工（SystemConfig 表，默认关闭） */
  private async isHolidayReportEnabled(): Promise<boolean> {
    const cfg = await this.prisma.systemConfig.findUnique({ where: { configKey: 'holiday_report_enabled' } });
    if (!cfg?.configValue) return false;
    return cfg.configValue === '1';
  }

  /** 用户个人是否允许节假日报工（FeishuUserCache.holidayReportEnabled，默认允许） */
  private async isUserHolidayEnabled(openId: string): Promise<boolean> {
    const user = await this.prisma.feishuUserCache.findUnique({ where: { openId } });
    return user ? user.holidayReportEnabled === 1 : true;
  }

  private getApprovalCode(): string {
    return this.config.get('FEISHU_APPROVAL_CODE') || '';
  }

  /** Decimal → number，方便前端展示 */
  private fmt(report: any): any {
    return {
      ...report,
      normalHours: Number(report.normalHours),
      overtimeHours: Number(report.overtimeHours),
      totalHours: Number(report.totalHours),
    };
  }

  /** 报工列表（筛选；非管理员默认只看自己） */
  async list(query: any, user: JwtUser) {
    const where: any = { deleted: 0 };
    if (query.projectId) where.projectId = Number(query.projectId);
    if (query.status) where.status = Number(query.status);
    if (query.userOpenId) where.userOpenId = query.userOpenId;
    if (query.startDate || query.endDate) {
      const range: any = {};
      if (query.startDate) range.gte = new Date(query.startDate);
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setDate(end.getDate() + 1); // 下一天 00:00，用 lt 排除时区偏移
        range.lt = end;
      }
      where.reportDate = range;
    } else if (query.reportDate) {
      where.reportDate = new Date(query.reportDate);
    }
    if (!user.isAdmin && !query.userOpenId) where.userOpenId = user.openId;

    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 20;
    const [total, items] = await this.prisma.$transaction([
      this.prisma.workReport.count({ where }),
      this.prisma.workReport.findMany({
        where,
        orderBy: { reportDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { project: true },
      }),
    ]);
    return { total, page, pageSize, items: items.map((i) => this.fmt(i)) };
  }

  /** 报工详情 */
  async detail(id: number) {
    const report = await this.prisma.workReport.findFirst({
      where: { id, deleted: 0 },
      include: { project: true },
    });
    if (!report) throw new NotFoundException('报工不存在');
    return this.fmt(report);
  }

  /** 提交报工（核心规则校验） */
  async create(dto: CreateReportDto, user: JwtUser) {
    const project = await this.requireProjectActive(dto.projectId);
    const reportDate = new Date(dto.reportDate);
    const isHoliday = await this.calendar.isHoliday(reportDate);

    // 节假日是否允许报工（全局配置 && 用户个人开关）
    if (isHoliday) {
      const globalEnabled = await this.isHolidayReportEnabled();
      const userEnabled = await this.isUserHolidayEnabled(user.openId);
      if (!globalEnabled || !userEnabled) {
        throw new BadRequestException('节假日不允许提交报工，请选择工作日');
      }
    }

    const limit = await this.getHoursLimit();
    const normal = dto.normalHours ?? 0;
    const overtime = dto.overtimeHours ?? 0;
    const total = normal + overtime;
    if (total <= 0) throw new BadRequestException('总时长必须大于 0');

    // 工作日普通时长：当天累计不能超过 limit（允许多次报工，剩余额度由系统自动计算）
    if (!isHoliday && normal > 0) {
      const used = await this.getUsedNormal(dto.reportDate, user.openId);
      if (used + normal > limit) {
        throw new BadRequestException(
          `今日普通时长已达上限（已报 ${used} 小时 / 上限 ${limit} 小时），普通报工最多还能报 ${Math.max(0, limit - used)} 小时`,
        );
      }
    }
    // 需求5/6：加班>0 或 节假日 → 需审批
    const needApproval = isHoliday || overtime > 0;

    // 需要审批时：指定审批人（报工人手动选择；未指定则兜底取项目负责人）
    let approverOpenId: string | null = null;
    if (needApproval) {
      approverOpenId = dto.approverOpenId || null;
      if (!approverOpenId) {
        const owners = await this.projectService.getOwnerOpenIds(project.id);
        approverOpenId = owners[0] || null;
      }
      if (!approverOpenId) {
        throw new BadRequestException('该报工需审批，请选择指定审批人');
      }
      const approver = await this.prisma.feishuUserCache.findUnique({ where: { openId: approverOpenId } });
      if (!approver) throw new BadRequestException('指定的审批人不存在，请重新选择');
    }

    const report = await this.prisma.workReport.create({
      data: {
        projectId: dto.projectId,
        reportDate,
        isHoliday: isHoliday ? 1 : 0,
        normalHours: normal,
        overtimeHours: overtime,
        totalHours: total,
        remark: dto.remark,
        needApproval: needApproval ? 1 : 0,
        status: needApproval ? REPORT_STATUS.PENDING : REPORT_STATUS.APPROVED,
        approverOpenId,
        userOpenId: user.openId,
        userName: user.name || null,
        createdBy: user.openId,
      },
    });

    if (needApproval) {
      // 系统内审批：需审批的报工保持「审批中」状态，由指定审批人在系统内审批（不再走飞书审批）
      // 如需恢复飞书审批，可在此调用 await this.submitApproval(report);
      await this.notifyApprover(report);
    }
    return this.fmt(report);
  }

  /** 通知指定审批人（失败不影响主流程） */
  private async notifyApprover(report: any) {
    if (!report.approverOpenId) return;
    try {
      const project = await this.prisma.project.findUnique({ where: { id: report.projectId } });
      const date = new Date(report.reportDate).toISOString().slice(0, 10);
      const msg = `您收到一条待审批报工：${project?.name || ''} ${date}，普通${Number(report.normalHours)}h / 加班${Number(report.overtimeHours)}h，请及时处理`;
      await this.feishuMessage.sendText(report.approverOpenId, msg);
    } catch (e: any) {
      this.logger.warn(`通知审批人失败: ${e?.message}`);
    }
  }

  /** 走飞书审批：创建实例 + 记录 + 卡片通知审批人 */
  private async submitApproval(report: any) {
    const project = await this.prisma.project.findUnique({ where: { id: report.projectId } });
    const approverOpenIds = await this.projectService.getOwnerOpenIds(report.projectId);
    const approvalCode = this.getApprovalCode();

    // 飞书审批创建失败不阻断报工提交：报工保持「审批中」，记录错误便于排查（可在配置修复后处理）
    let instance: any = null;
    try {
      instance = await this.feishuApproval.createInstance({
        approvalCode,
        openId: report.userOpenId,
        form: [
          { name: '项目', value: project?.name || '' },
          { name: '报工日期', value: report.reportDate.toISOString().slice(0, 10) },
          { name: '普通时长', value: String(Number(report.normalHours)) },
          { name: '加班时长', value: String(Number(report.overtimeHours)) },
          { name: '备注', value: report.remark || '' },
        ],
        approverOpenIds: approverOpenIds.length ? approverOpenIds : [report.userOpenId],
      });
    } catch (err: any) {
      this.logger.error(`创建飞书审批失败（报工 ${report.id}）: ${err?.message}`, err?.stack);
      return;
    }

    await this.prisma.workReport.update({
      where: { id: report.id },
      data: { approvalInstanceId: instance.instance_id, approverOpenId: approverOpenIds[0] || null },
    });
    await this.prisma.workReportApproval.create({
      data: {
        workReportId: report.id,
        approvalCode,
        approvalInstanceId: instance.instance_id,
        applicantOpenId: report.userOpenId,
        currentApproverOpenId: approverOpenIds[0] || null,
        formSnapshot: {
          projectId: report.projectId,
          reportDate: report.reportDate.toISOString().slice(0, 10),
          normalHours: Number(report.normalHours),
          overtimeHours: Number(report.overtimeHours),
        },
      },
    });

    // 卡片通知审批人（失败不影响主流程）
    for (const openId of approverOpenIds) {
      try {
        await this.feishuMessage.sendCard(openId, {
          config: { wide_screen_mode: true },
          header: { title: { tag: 'plain_text', content: '📋 收到一条报工待审批' }, template: 'orange' },
          elements: [
            {
              tag: 'div',
              text: {
                tag: 'lark_md',
                content: `**${project?.name || ''}**\n报工日期：${report.reportDate.toISOString().slice(0, 10)}\n普通时长：${report.normalHours} h｜加班时长：${report.overtimeHours} h\n申请人：${report.userName || report.userOpenId}`,
              },
            },
          ],
        });
      } catch {
        // ignore
      }
    }
  }

  /** 编辑（仅本人/管理员；仅审批中） */
  async update(id: number, dto: UpdateReportDto, user: JwtUser) {
    const report = await this.requireReport(id);
    if (!user.isAdmin && report.userOpenId !== user.openId) throw new ForbiddenException('仅本人或管理员可编辑');
    if (report.status !== REPORT_STATUS.PENDING) throw new BadRequestException('仅审批中的报工可编辑');

    const data: any = {};
    if (dto.remark !== undefined) data.remark = dto.remark;
    if (dto.normalHours !== undefined || dto.overtimeHours !== undefined) {
      const normal = dto.normalHours ?? Number(report.normalHours);
      const overtime = dto.overtimeHours ?? Number(report.overtimeHours);
      data.normalHours = normal;
      data.overtimeHours = overtime;
      data.totalHours = normal + overtime;
    }
    const updated = await this.prisma.workReport.update({ where: { id }, data });
    return this.fmt(updated);
  }

  /** 撤销（本人/项目负责人/管理员；同步撤销飞书审批） */
  async remove(id: number, user: JwtUser) {
    const report = await this.requireReport(id);
    const isOwner = await this.projectService.isOwner(report.projectId, user.openId);
    if (!user.isAdmin && report.userOpenId !== user.openId && !isOwner) {
      throw new ForbiddenException('仅本人/项目负责人/管理员可撤销');
    }
    if (report.status === REPORT_STATUS.APPROVED) {
      throw new BadRequestException('已通过的报工不可直接撤销（如需更正请走撤销申请）');
    }
    if (report.approvalInstanceId) {
      try {
        await this.feishuApproval.cancelInstance(report.approvalInstanceId, report.userOpenId);
      } catch {
        // 审批实例可能已结束，忽略
      }
    }
    await this.prisma.workReport.update({
      where: { id },
      data: { deleted: 1, status: REPORT_STATUS.CANCELLED },
    });
    return { success: true };
  }

  private async requireReport(id: number) {
    const report = await this.prisma.workReport.findFirst({ where: { id, deleted: 0 } });
    if (!report) throw new NotFoundException('报工不存在');
    return report;
  }

  private async requireProjectActive(projectId: number) {
    const project = await this.prisma.project.findFirst({ where: { id: projectId, deleted: 0 } });
    if (!project) throw new NotFoundException('项目不存在');
    if (project.status !== 1) throw new BadRequestException('该项目不在进行中，无法报工');
    return project;
  }

  /** 当日普通时长额度查询（前端用于自动计算普通报工时长） */
  async getQuota(reportDate: string, user: JwtUser) {
    const limit = await this.getHoursLimit();
    const used = await this.getUsedNormal(reportDate, user.openId);
    return { limit, used, remaining: Math.max(0, limit - used) };
  }

  /** 统计某日该用户已报的普通时长合计（排除已撤销/删除） */
  private async getUsedNormal(reportDate: string, openId: string): Promise<number> {
    const start = new Date(reportDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const agg = await this.prisma.workReport.aggregate({
      where: {
        userOpenId: openId,
        reportDate: { gte: start, lt: end },
        deleted: 0,
        status: { not: REPORT_STATUS.CANCELLED },
      },
      _sum: { normalHours: true },
    });
    return Number(agg._sum.normalHours || 0);
  }

  /** 导出报工记录（管理员）为 Excel buffer，支持日期区间过滤 */
  async exportAll(query: any = {}): Promise<Buffer> {
    const where: any = { deleted: 0 };
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
    const items = await this.prisma.workReport.findMany({
      where,
      include: { project: true },
      orderBy: [{ reportDate: 'desc' }, { id: 'desc' }],
      take: 10000,
    });
    const rows = items.map((r) => ({
      项目: r.project?.name || '',
      报工日期: r.reportDate.toISOString().slice(0, 10),
      '普通时长(小时)': Number(r.normalHours),
      '加班时长(小时)': Number(r.overtimeHours),
      '总时长(小时)': Number(r.totalHours),
      类型: r.isHoliday ? '节假日' : '工作日',
      状态: this.statusText(r.status),
      报工人: r.userName || r.userOpenId,
      备注: r.remark || '',
      驳回原因: r.rejectReason || '',
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 16 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 24 }, { wch: 24 }];
    XLSX.utils.book_append_sheet(wb, ws, '报工记录');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }

  private statusText(s: number) {
    return ({ 1: '审批中', 2: '已通过', 3: '已驳回', 4: '已撤销' } as Record<number, string>)[s] || String(s);
  }
}
