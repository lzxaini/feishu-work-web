/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:38:47
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:38:48
 * @FilePath: \feishu-work\server\src\modules\user\user.controller.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  /** 通讯录用户列表（走缓存，支持搜索） */
  @UseGuards(JwtAuthGuard)
  @Get()
  list(@Query('keyword') keyword?: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.userService.list(keyword, Number(page) || 1, Number(pageSize) || 20);
  }

  /** 手动同步通讯录（管理员） */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('sync')
  sync() {
    return this.userService.sync();
  }

  /** 设置用户是否允许节假日报工（管理员） */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':openId/holiday')
  setHoliday(@Param('openId') openId: string, @Body() body: { enabled: boolean }) {
    return this.userService.setHolidayEnabled(openId, !!body.enabled);
  }
}
