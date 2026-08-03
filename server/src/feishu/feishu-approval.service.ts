/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:37:35
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:37:36
 * @FilePath: \feishu-work\server\src\feishu\feishu-approval.service.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Injectable } from '@nestjs/common';
import { FeishuService } from './feishu.service';

export interface ApprovalFormItem {
  name: string;
  value: string;
}

/**
 * 飞书审批中心：创建/查询/撤销审批实例
 * 对应 docs/04 第五节
 */
@Injectable()
export class FeishuApprovalService {
  constructor(private feishu: FeishuService) {}

  /** 创建审批实例，返回 { instance_id, instance_code } */
  async createInstance(params: {
    approvalCode: string;
    openId: string;
    form: ApprovalFormItem[];
    approverOpenIds: string[];
  }) {
    return this.feishu.request('post', '/approval/v4/instances', {
      approval_code: params.approvalCode,
      user_id: params.openId,
      form: params.form,
      node_approver_open_id_list: [params.approverOpenIds],
    });
  }

  /** 查询审批实例状态（兜底对账用） */
  async getInstance(instanceId: string): Promise<any> {
    return this.feishu.request('get', `/approval/v4/instances/${instanceId}`);
  }

  /** 撤销审批实例（报工撤销时） */
  async cancelInstance(instanceId: string, openId: string) {
    return this.feishu.request('post', '/approval/v4/instances/cancel', {
      instance_id: instanceId,
      user_id: openId,
    });
  }
}
