/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:40:52
 * @LastEditors: 17630921248 1245634367@qq.com
 * @LastEditTime: 2026-08-07 08:45:23
 * @FilePath: \feishu-work-web\server\src\modules\approval\approval.service.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { FeishuApprovalService } from '../../feishu/feishu-approval.service';
import { FeishuMessageService } from '../../feishu/feishu-message.service';
import { ProjectService } from '../project/project.service';
import { APPROVAL_STATUS, REPORT_STATUS } from '../../common/constants';
import { JwtUser } from '../../common/decorators/current-user.decorator';

/**
 * 审批对接：系统内审批 + 飞书事件回调解析 + 状态回写 + 主动对账
 */
@Injectable()
export class ApprovalService {
  private readonly logger = new Logger(ApprovalService.name);

  constructor(
    private prisma: PrismaService,
    private feishuApproval: FeishuApprovalService,
    private feishuMessage: FeishuMessageService,
    private projectService: ProjectService,
    private config: ConfigService,
  ) {}

  /** 系统内审批：当前用户为指定审批人的待审批报工（管理员可看全部） */
  async listPending(user: JwtUser) {
    const where: any = { status: REPORT_STATUS.PENDING, deleted: 0 };
    if (!user.isAdmin) where.approverOpenId = user.openId;
    const items = await this.prisma.workReport.findMany({
      where,
      include: { project: true },
      orderBy: { reportDate: 'desc' },
      take: 200,
    });
    return items.map((i) => this.fmt(i));
  }

  /** 审批通过 */
  async approve(id: number, user: JwtUser) {
    const report = await this.requirePending(id, user);
    const updated = await this.prisma.workReport.update({
      where: { id },
      data: { status: REPORT_STATUS.APPROVED, approvedAt: new Date() },
    });
    await this.notifyApproval(report, true, undefined, user.name);
    return this.fmt(updated);
  }

  /** 审批驳回 */
  async reject(id: number, user: JwtUser, reason?: string) {
    const report = await this.requirePending(id, user);
    const updated = await this.prisma.workReport.update({
      where: { id },
      data: { status: REPORT_STATUS.REJECTED, rejectReason: reason || '' },
    });
    await this.notifyApproval(report, false, reason, user.name);
    return this.fmt(updated);
  }

  private async requirePending(id: number, user: JwtUser) {
    const report = await this.prisma.workReport.findFirst({ where: { id, deleted: 0, status: REPORT_STATUS.PENDING } });
    if (!report) throw new NotFoundException('待审批报工不存在或已处理');
    if (!user.isAdmin && report.approverOpenId !== user.openId) {
      // 兼容历史数据：未指定审批人的旧报工仍可由项目负责人审批
      if (!report.approverOpenId) {
        const isOwner = await this.projectService.isOwner(report.projectId, user.openId);
        if (isOwner) return report;
      }
      throw new ForbiddenException('仅指定审批人或管理员可审批');
    }
    return report;
  }

  private fmt(report: any): any {
    return {
      ...report,
      normalHours: Number(report.normalHours),
      overtimeHours: Number(report.overtimeHours),
      totalHours: Number(report.totalHours),
    };
  }

  /** 审批通知（卡片 + 跳转）：结构化展示审批结果 */
  private async notifyApproval(report: any, approved: boolean, reason?: string, approverName?: string) {
    try {
      const project = await this.prisma.project.findUnique({ where: { id: report.projectId } });
      const name = project?.name || '';
      const date = this.formatDate(report.reportDate);
      const normal = Number(report.normalHours);
      const overtime = Number(report.overtimeHours);
      const lines = [
        `**项目**：${name}`,
        `**报工日期**：${date}`,
        `**报工时长**：普通 ${normal}h ｜ 加班 ${overtime}h ｜ 合计 ${Number(report.totalHours)}h`,
        `**报工类型**：${report.isHoliday ? '节假日' : '工作日'}`,
        `**提交人**：${report.userName || report.userOpenId}`,
        `**审批结果**：${approved ? '✅ 已通过' : '❌ 已驳回'}`,
      ];
      if (!approved) lines.push(`**驳回原因**：${reason || '无'}`);
      if (approverName) lines.push(`**审批人**：${approverName}`);

      const webUrl = this.config.get('APP_WEB_URL') || '';
      await this.feishuMessage.sendActionCard(report.userOpenId, {
        title: approved ? '✅ 报工审批通过' : '❌ 报工审批驳回',
        template: approved ? 'green' : 'red',
        lines,
        buttonText: '查看报工',
        url: `${webUrl}/reports`,
      });
    } catch (e: any) {
      // 消息发送失败（如飞书未开通消息权限）不影响审批结果，仅记录
      this.logger.warn(`通知报工人失败: ${e?.message}`);
    }
  }

  private formatDate(d: any): string {
    const date = new Date(d);
    return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日`;
  }

  /**
   * 飞书事件回调入口（approval_instance）
   * 说明：生产环境事件体可能用 Encrypt Key 加密（body.encrypt），需解密后再解析；
   * 此处为简化，收到回调后主动查询实例真实状态再回写，保证准确。
   */
  async handleCallback(body: any) {
    if (body?.encrypt) {
      // 已启用加密：需用 FEISHU_EVENT_ENCRYPT_KEY 解密（官方 SDK 已封装）
      this.logger.warn('收到加密事件回调，请接入解密逻辑');
      return { code: 0 };
    }
    const event = body?.event || {};
    const instanceId = event.instance_id || event.instance_code;
    if (!instanceId) {
      // 可能是 URL 校验请求（challenge）
      if (body?.challenge) return { challenge: body.challenge };
      return { code: 0 };
    }
    await this.syncByInstanceId(instanceId);
    return { code: 0 };
  }

  /** 主动查询审批实例状态并回写本地 */
  async syncByInstanceId(instanceId: string) {
    const approval = await this.prisma.workReportApproval.findUnique({ where: { approvalInstanceId: instanceId } });
    if (!approval) return;
    const report = await this.prisma.workReport.findUnique({ where: { id: approval.workReportId } });
    if (!report) return;

    let feishuStatus = 'PENDING';
    try {
      const inst = await this.feishuApproval.getInstance(instanceId);
      feishuStatus = inst?.status || 'PENDING';
    } catch (e) {
      this.logger.warn(`查询审批实例失败: ${instanceId} ${(e as Error).message}`);
      return;
    }
    await this.applyFeishuStatus(report, feishuStatus);
  }

  /** 将飞书审批状态应用到本地报工并通知报工人 */
  async applyFeishuStatus(report: any, feishuStatus: string) {
    let status: number = REPORT_STATUS.PENDING;
    let approvalStatus: number = APPROVAL_STATUS.PENDING;
    if (feishuStatus === 'APPROVED') {
      status = REPORT_STATUS.APPROVED;
      approvalStatus = APPROVAL_STATUS.APPROVED;
    } else if (feishuStatus === 'REJECTED') {
      status = REPORT_STATUS.REJECTED;
      approvalStatus = APPROVAL_STATUS.REJECTED;
    } else if (feishuStatus === 'CANCELED') {
      status = REPORT_STATUS.CANCELLED;
      approvalStatus = APPROVAL_STATUS.CANCELLED;
    }

    if (status === report.status) return;

    await this.prisma.workReport.update({
      where: { id: report.id },
      data: { status, approvedAt: status === REPORT_STATUS.APPROVED ? new Date() : report.approvedAt },
    });
    await this.prisma.workReportApproval.update({
      where: { workReportId: report.id },
      data: { approvalStatus },
    });

    // 通知报工人
    try {
      if (status === REPORT_STATUS.APPROVED) {
        await this.feishuMessage.sendText(report.userOpenId, '✅ 你的报工已通过审批');
      } else if (status === REPORT_STATUS.REJECTED) {
        await this.feishuMessage.sendText(report.userOpenId, '❌ 你的报工被驳回，请查看飞书审批详情');
      }
    } catch {
      // ignore
    }
    this.logger.log(`报工 ${report.id} 状态更新为 ${status}`);
  }

  /** 对账：扫描本地审批中的报工，主动查询飞书状态（防丢事件） */
  async reconcilePending() {
    const pending = await this.prisma.workReport.findMany({
      where: { status: REPORT_STATUS.PENDING, approvalInstanceId: { not: null } },
      take: 50,
    });
    for (const r of pending) {
      if (!r.approvalInstanceId) continue;
      try {
        await this.syncByInstanceId(r.approvalInstanceId);
      } catch (e) {
        this.logger.warn(`对账失败 report=${r.id}: ${(e as Error).message}`);
      }
    }
    return { checked: pending.length };
  }
}
