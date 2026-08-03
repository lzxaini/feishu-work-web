/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:40:25
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:40:26
 * @FilePath: \feishu-work\server\src\modules\report\report.controller.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto, UpdateReportDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Get()
  list(@Query() query: any, @CurrentUser() user: JwtUser) {
    return this.reportService.list(query, user);
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
