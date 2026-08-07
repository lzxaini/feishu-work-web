/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:39:54
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:39:55
 * @FilePath: \feishu-work\server\src\modules\calendar\calendar.controller.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  /** 判断某日是否节假日 */
  @Get('is-holiday')
  async isHoliday(@Query('date') date: string) {
    return { isHoliday: await this.calendarService.isHoliday(date) };
  }

  /** 例外规则列表 */
  @Get('rules')
  listRules() {
    return this.calendarService.listRules();
  }

  /** 从配置的 JSON 链接同步节假日（管理员；body.url 可选覆盖） */
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post('sync')
  sync(@Body() body: { url?: string }) {
    return this.calendarService.syncFromConfig(body?.url);
  }

  /** 新增例外（管理员） */
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post('rules')
  createRule(@Body() body: { calDate: string; dayType: number; name?: string }) {
    return this.calendarService.createRule(body);
  }

  /** 删除例外（管理员） */
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete('rules/:id')
  removeRule(@Param('id', ParseIntPipe) id: number) {
    return this.calendarService.removeRule(id);
  }
}
