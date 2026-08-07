/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:37:57
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:37:57
 * @FilePath: \feishu-work\server\src\modules\auth\auth.service.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FeishuAuthService } from '../../feishu/feishu-auth.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private feishuAuth: FeishuAuthService,
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  /** 端内免登登录：code → 用户身份 → 签发本系统 JWT（仅启用用户或管理员可登录） */
  async login(code: string) {
    const userInfo = await this.feishuAuth.loginByCode(code);
    const admin = await this.prisma.admin.findUnique({ where: { openId: userInfo.open_id } });
    const isAdmin = !!admin;
    // 非管理员且未启用系统 → 拒绝登录
    if (!isAdmin) {
      const cached = await this.prisma.feishuUserCache.findUnique({ where: { openId: userInfo.open_id } });
      if (!cached || cached.systemEnabled !== 1) {
        throw new ForbiddenException('账号未启用，请联系管理员开通');
      }
    }
    const payload = { sub: userInfo.open_id, name: userInfo.name, isAdmin };
    const token = this.jwt.sign(payload);
    return {
      token,
      user: {
        openId: userInfo.open_id,
        name: userInfo.name || '',
        avatarUrl: userInfo.avatar_url || '',
        isAdmin,
      },
    };
  }

  /**
   * 临时登录（仅本地调试）：以管理员身份签发 JWT，绕过飞书授权
   * 仅当 DEV_LOGIN_ENABLED=1 时开放；生产环境该变量不设置 → 直接 404
   */
  async devLogin() {
    if (process.env.DEV_LOGIN_ENABLED !== '1') {
      throw new NotFoundException('临时登录未启用');
    }
    // 优先取第一个全局管理员作为调试身份；无管理员时用默认调试账号
    const admin = await this.prisma.admin.findFirst({ orderBy: { id: 'asc' } });
    const openId = admin?.openId || 'dev_user_open_id';
    let name = admin?.userName || '';
    if (!name) {
      const cached = await this.prisma.feishuUserCache.findUnique({ where: { openId } });
      name = cached?.name || '调试管理员';
    }
    const payload = { sub: openId, name, isAdmin: true };
    const token = this.jwt.sign(payload);
    return {
      token,
      user: { openId, name, avatarUrl: '', isAdmin: true },
    };
  }

  /** 当前用户信息 */
  async me(openId: string) {
    const cached = await this.prisma.feishuUserCache.findUnique({ where: { openId } });
    const admin = await this.prisma.admin.findUnique({ where: { openId } });
    return { openId, name: cached?.name || '', isAdmin: !!admin };
  }
}
