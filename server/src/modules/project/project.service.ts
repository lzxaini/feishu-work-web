/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:39:11
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:39:11
 * @FilePath: \feishu-work\server\src\modules\project\project.service.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';
import { PROJECT_STATUS } from '../../common/constants';
import { JwtUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  /** 项目列表（分页/搜索/状态优先级过滤） */
  async list(query: { keyword?: string; status?: string; priority?: string; page?: number; pageSize?: number }) {
    const where: any = { deleted: 0 };
    if (query.keyword) where.name = { contains: query.keyword };
    if (query.status) where.status = Number(query.status);
    if (query.priority) where.priority = Number(query.priority);
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const [total, items] = await this.prisma.$transaction([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { members: { where: { role: 1 } } },
      }),
    ]);
    return { total, page, pageSize, items };
  }

  /** 项目详情 */
  async detail(id: number) {
    const project = await this.prisma.project.findFirst({
      where: { id, deleted: 0 },
      include: { members: true },
    });
    if (!project) throw new NotFoundException('项目不存在');
    return project;
  }

  /** 新增项目（管理员） */
  async create(dto: CreateProjectDto, user: JwtUser) {
    const owners = dto.ownerOpenIds || [];
    const nameMap = await this.resolveNames(owners);
    return this.prisma.project.create({
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        status: dto.status ?? PROJECT_STATUS.ACTIVE,
        priority: dto.priority ?? 3,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        contractDate: dto.contractDate ? new Date(dto.contractDate) : null,
        contractNo: dto.contractNo,
        rdProjectDoc: dto.rdProjectDoc,
        contractAmount: dto.contractAmount ?? null,
        remark: dto.remark,
        patentApplied: dto.patentApplied ?? 0,
        rdCostAmortization: dto.rdCostAmortization ?? null,
        createdByOpenId: user.openId,
        members: {
          create: owners.map((o) => ({ openId: o, userName: nameMap.get(o) || null, role: 1 })),
        },
      },
      include: { members: true },
    });
  }

  /** 编辑项目（管理员/负责人） */
  async update(id: number, dto: UpdateProjectDto, user: JwtUser) {
    await this.requireProject(id);
    await this.assertOwnerOrAdmin(id, user);

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.code !== undefined) data.code = dto.code;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.startDate !== undefined) data.startDate = dto.startDate ? new Date(dto.startDate) : null;
    if (dto.endDate !== undefined) data.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.contractDate !== undefined) data.contractDate = dto.contractDate ? new Date(dto.contractDate) : null;
    if (dto.contractNo !== undefined) data.contractNo = dto.contractNo;
    if (dto.rdProjectDoc !== undefined) data.rdProjectDoc = dto.rdProjectDoc;
    if (dto.contractAmount !== undefined) data.contractAmount = dto.contractAmount;
    if (dto.remark !== undefined) data.remark = dto.remark;
    if (dto.patentApplied !== undefined) data.patentApplied = dto.patentApplied;
    if (dto.rdCostAmortization !== undefined) data.rdCostAmortization = dto.rdCostAmortization;

    // 更新负责人：删除原负责人再重建
    if (dto.ownerOpenIds) {
      await this.prisma.projectMember.deleteMany({ where: { projectId: id, role: 1 } });
      const nameMap = await this.resolveNames(dto.ownerOpenIds);
      data.members = {
        create: dto.ownerOpenIds.map((o) => ({ openId: o, userName: nameMap.get(o) || null, role: 1 })),
      };
    }

    return this.prisma.project.update({ where: { id }, data, include: { members: true } });
  }

  /** 删除项目（软删除，仅管理员） */
  async remove(id: number, user: JwtUser) {
    await this.requireProject(id);
    if (!user.isAdmin) throw new ForbiddenException('仅管理员可删除项目');
    await this.prisma.project.update({ where: { id }, data: { deleted: 1 } });
    return { success: true };
  }

  /** 判断用户是否为项目负责人 */
  async isOwner(projectId: number, openId: string): Promise<boolean> {
    const m = await this.prisma.projectMember.findFirst({ where: { projectId, openId, role: 1 } });
    return !!m;
  }

  /** 获取项目负责人 open_id 列表 */
  async getOwnerOpenIds(projectId: number): Promise<string[]> {
    const owners = await this.prisma.projectMember.findMany({ where: { projectId, role: 1 } });
    return owners.map((o) => o.openId);
  }

  private async requireProject(id: number) {
    const project = await this.prisma.project.findFirst({ where: { id, deleted: 0 } });
    if (!project) throw new NotFoundException('项目不存在');
    return project;
  }

  private async assertOwnerOrAdmin(id: number, user: JwtUser) {
    if (user.isAdmin) return;
    const owner = await this.prisma.projectMember.findFirst({ where: { projectId: id, openId: user.openId, role: 1 } });
    if (!owner) throw new ForbiddenException('仅管理员或项目负责人可操作');
  }

  private async resolveNames(openIds: string[]): Promise<Map<string, string>> {
    if (openIds.length === 0) return new Map();
    const users = await this.prisma.feishuUserCache.findMany({ where: { openId: { in: openIds } } });
    return new Map(users.map((u) => [u.openId, u.name]));
  }
}
