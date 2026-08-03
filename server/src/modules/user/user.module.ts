/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:38:44
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:38:45
 * @FilePath: \feishu-work\server\src\modules\user\user.module.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
