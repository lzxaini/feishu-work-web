/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:38:52
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:38:53
 * @FilePath: \feishu-work\server\src\modules\project\project.module.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
