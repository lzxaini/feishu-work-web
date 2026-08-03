/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:37:59
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:37:59
 * @FilePath: \feishu-work\server\src\modules\auth\jwt.strategy.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'feishu-work-secret',
    });
  }

  async validate(payload: { sub: string; name?: string; isAdmin?: boolean }) {
    return { openId: payload.sub, name: payload.name, isAdmin: payload.isAdmin };
  }
}
