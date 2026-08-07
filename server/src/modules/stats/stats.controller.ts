/*
 * @Author: 17630921248 1245634367@qq.com
 * @Date: 2026-08-07 16:48:02
 * @LastEditors: 17630921248 1245634367@qq.com
 * @LastEditTime: 2026-08-07 16:48:04
 * @FilePath: \feishu-work-web\server\src\modules\stats\stats.controller.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-07 16:00:00
 * @LastEditors: lzx 1245634367@qq.com
 * @FilePath: \feishu-work-web\server\src\modules\stats\stats.controller.ts
 * @Description: 报工统计接口（仅管理员）
 */
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class StatsController {
  constructor(private statsService: StatsService) {}

  /** 报工统计：按用户×日期汇总启用系统用户的总报工时长，支持用户/日期区间筛选 */
  @Get('daily')
  daily(@Query() query: { startDate?: string; endDate?: string; openId?: string }) {
    return this.statsService.daily(query);
  }

  /** 提醒报工：给指定日期尚未报工的启用用户推送卡片（openId 为空则提醒全部；force=true 直接发送） */
  @Post('remind')
  remind(@Body() body: { date?: string; openId?: string; force?: boolean }) {
    return this.statsService.remind(body);
  }
}
