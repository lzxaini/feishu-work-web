/*
 * @Author: 17630921248 1245634367@qq.com
 * @Date: 2026-08-07 16:48:03
 * @LastEditors: 17630921248 1245634367@qq.com
 * @LastEditTime: 2026-08-07 16:48:05
 * @FilePath: \feishu-work-web\server\src\modules\stats\stats.module.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-07 16:00:00
 * @LastEditors: lzx 1245634367@qq.com
 * @FilePath: \feishu-work-web\server\src\modules\stats\stats.module.ts
 * @Description: 报工统计模块（PrismaService / FeishuMessageService 均为全局，无需导入）
 */
import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
