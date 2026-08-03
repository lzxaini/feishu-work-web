/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:36:53
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:36:53
 * @FilePath: \feishu-work\server\src\common\decorators\current-user.decorator.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// JWT 解析后的当前用户
export interface JwtUser {
  openId: string;
  name?: string;
  isAdmin?: boolean;
}

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): JwtUser => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
