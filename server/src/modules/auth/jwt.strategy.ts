/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:37:59
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:37:59
 * @FilePath: \feishu-work\server\src\modules\auth\jwt.strategy.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'feishu-work-secret',
    });
  }

  async validate(payload: { sub: string; name?: string; isAdmin?: boolean }) {
    // 请求级校验：非管理员且用户被禁用 → 立即拒绝（即使 token 未过期）
    if (!payload.isAdmin) {
      const cached = await this.prisma.feishuUserCache.findUnique({ where: { openId: payload.sub } });
      if (!cached || cached.systemEnabled !== 1) {
        throw new UnauthorizedException('账号未启用，请联系管理员开通');
      }
    }
    return { openId: payload.sub, name: payload.name, isAdmin: payload.isAdmin };
  }
}
