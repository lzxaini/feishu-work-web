/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:40:25
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:40:26
 * @FilePath: \feishu-work\server\src\modules\report\report.controller.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportService } from './report.service';
import { CreateReportDto, UpdateReportDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Get()
  list(@Query() query: any, @CurrentUser() user: JwtUser) {
    return this.reportService.list(query, user);
  }

  /** 当日普通时长额度（自动计算剩余可报普通工时） */
  @Get('quota')
  quota(@Query('reportDate') reportDate: string, @CurrentUser() user: JwtUser) {
    return this.reportService.getQuota(reportDate, user);
  }

  /** 导出全部报工记录（仅管理员，支持日期区间过滤） */
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('export')
  async exportAll(@Query() query: any, @Res() res: Response) {
    const buffer = await this.reportService.exportAll(query);
    const date = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=report_${date}.xlsx`);
    res.send(buffer);
  }

  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.reportService.detail(id);
  }

  @Post()
  create(@Body() dto: CreateReportDto, @CurrentUser() user: JwtUser) {
    return this.reportService.create(dto, user);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReportDto, @CurrentUser() user: JwtUser) {
    return this.reportService.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtUser) {
    return this.reportService.remove(id, user);
  }
}
