/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:37:57
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:37:57
 * @FilePath: \feishu-work\server\src\modules\auth\auth.service.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Injectable } from '@nestjs/common';
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

  /** 端内免登登录：code → 用户身份 → 签发本系统 JWT */
  async login(code: string) {
    const userInfo = await this.feishuAuth.loginByCode(code);
    const admin = await this.prisma.admin.findUnique({ where: { openId: userInfo.open_id } });
    const isAdmin = !!admin;
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

  /** 当前用户信息 */
  async me(openId: string) {
    const cached = await this.prisma.feishuUserCache.findUnique({ where: { openId } });
    const admin = await this.prisma.admin.findUnique({ where: { openId } });
    return { openId, name: cached?.name || '', isAdmin: !!admin };
  }
}
