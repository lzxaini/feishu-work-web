/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:36:57
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:36:57
 * @FilePath: \feishu-work\server\src\common\guards\auth.guard.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// JWT 登录守卫（配合 jwt.strategy）
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
