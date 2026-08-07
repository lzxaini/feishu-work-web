/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:37:33
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:37:33
 * @FilePath: \feishu-work\server\src\feishu\feishu-auth.service.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { FeishuService } from './feishu.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 飞书认证与通讯录：端内免登 + 用户信息 + 通讯录同步
 * 对应 docs/04 第三节（端内免登为主）
 */
@Injectable()
export class FeishuAuthService {
  private readonly logger = new Logger(FeishuAuthService.name);

  constructor(
    private feishu: FeishuService,
    private prisma: PrismaService,
  ) {}

  /** 免登：预授权码 code → user_access_token（用 app_access_token 换取） */
  async code2Token(code: string): Promise<any> {
    const appToken = await this.feishu.getAppToken();
    return this.feishu.request('post', '/authen/v1/access_token', { grant_type: 'authorization_code', code }, appToken);
  }

  /** 获取用户信息（open_id/name/avatar 等） */
  async getUserInfo(userAccessToken: string): Promise<any> {
    return this.feishu.request('get', '/authen/v1/user_info', undefined, userAccessToken);
  }

  /** 端内免登完整流程：code → 用户信息（并写缓存） */
  async loginByCode(code: string): Promise<any> {
    const tokenData = await this.code2Token(code);
    const userInfo = await this.getUserInfo(tokenData.access_token);
    if (!userInfo?.open_id) throw new UnauthorizedException('未获取到用户 open_id');

    await this.prisma.feishuUserCache.upsert({
      where: { openId: userInfo.open_id },
      update: { name: userInfo.name || '', lastSyncAt: new Date() },
      create: {
        openId: userInfo.open_id,
        unionId: userInfo.union_id ?? null,
        userId: userInfo.user_id ?? null,
        name: userInfo.name || '',
        mobile: userInfo.mobile ?? null,
        email: userInfo.email ?? null,
        lastSyncAt: new Date(),
      },
    });
    return userInfo;
  }

  /** 通讯录同步：拉取根部门下所有用户到缓存表 */
  async syncUsers(): Promise<{ count: number }> {
    const depData = await this.feishu.request('get', '/contact/v3/departments?parent_department_id=0&page_size=50');
    // 飞书 v3 部门接口返回 open_department_id（department_id 仅在有旧版 ID 权限时才返回）
    const departments: { open_department_id: string; name?: string }[] = depData?.items || [];

    let count = 0;
    for (const dep of departments) {
      let pageToken = '';
      do {
        const path = `/contact/v3/users?department_id=${dep.open_department_id}&page_size=50${pageToken ? `&page_token=${pageToken}` : ''}`;
        const data = await this.feishu.request('get', path);
        const items: any[] = data?.items || [];
        for (const u of items) {
          await this.prisma.feishuUserCache.upsert({
            where: { openId: u.open_id },
            // update：仅在返回有效值时覆盖，避免把已有姓名/联系方式清空（权限受限时接口可能不返回 name）
            update: {
              ...(u.name ? { name: u.name } : {}),
              ...(u.union_id ? { unionId: u.union_id } : {}),
              ...(u.user_id ? { userId: u.user_id } : {}),
              ...(u.mobile ? { mobile: u.mobile } : {}),
              ...(u.email ? { email: u.email } : {}),
              departmentName: dep.name,
              lastSyncAt: new Date(),
            },
            create: {
              openId: u.open_id,
              unionId: u.union_id || null,
              userId: u.user_id || null,
              name: u.name || '',
              mobile: u.mobile || null,
              email: u.email || null,
              departmentName: dep.name,
              lastSyncAt: new Date(),
            },
          });
          count++;
        }
        pageToken = data?.has_more ? data?.page_token : '';
      } while (pageToken);
    }
    this.logger.log(`通讯录同步完成，共 ${count} 人`);
    return { count };
  }
}
