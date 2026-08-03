/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:41:21
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:41:22
 * @FilePath: \feishu-work\server\src\modules\admin\admin.controller.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('admin/list')
  list() {
    return this.adminService.list();
  }

  @Post('admin')
  add(@Body() body: { openId: string }) {
    return this.adminService.add(body.openId);
  }

  @Delete('admin/:openId')
  remove(@Param('openId') openId: string) {
    return this.adminService.remove(openId);
  }

  @Get('config')
  getConfig() {
    return this.adminService.getConfig();
  }

  @Put('config')
  setConfig(@Body() body: { configKey: string; configValue: string }) {
    return this.adminService.setConfig(body.configKey, body.configValue);
  }
}
