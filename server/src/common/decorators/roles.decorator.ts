/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:36:55
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:36:56
 * @FilePath: \feishu-work\server\src\common\decorators\roles.decorator.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
