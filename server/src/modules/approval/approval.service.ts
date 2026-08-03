/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:40:52
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:40:52
 * @FilePath: \feishu-work\server\src\modules\approval\approval.service.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FeishuApprovalService } from '../../feishu/feishu-approval.service';
import { FeishuMessageService } from '../../feishu/feishu-message.service';
import { APPROVAL_STATUS, REPORT_STATUS } from '../../common/constants';

/**
 * 审批对接：事件回调解析 + 状态回写 + 主动对账
 * 对应 docs/04 5.2 / 5.3
 */
@Injectable()
export class ApprovalService {
  private readonly logger = new Logger(ApprovalService.name);

  constructor(
    private prisma: PrismaService,
    private feishuApproval: FeishuApprovalService,
    private feishuMessage: FeishuMessageService,
  ) {}

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
