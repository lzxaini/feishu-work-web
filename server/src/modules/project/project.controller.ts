/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:39:14
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:39:14
 * @FilePath: \feishu-work\server\src\modules\project\project.controller.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Get()
  list(
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.projectService.list({ keyword, status, priority, page: Number(page) || 1, pageSize: Number(pageSize) || 20 });
  }

  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.detail(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: JwtUser) {
    return this.projectService.create(dto, user);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectDto, @CurrentUser() user: JwtUser) {
    return this.projectService.update(id, dto, user);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtUser) {
    return this.projectService.remove(id, user);
  }
}
