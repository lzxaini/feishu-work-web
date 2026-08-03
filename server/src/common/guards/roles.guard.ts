/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:36:59
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:36:59
 * @FilePath: \feishu-work\server\src\common\guards\roles.guard.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

// 角色守卫：Roles('admin') 仅管理员可访问
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length === 0) return true;
    const { user } = context.switchToHttp().getRequest();
    return roles.every((r) => (r === 'admin' ? !!user?.isAdmin : true));
  }
}
