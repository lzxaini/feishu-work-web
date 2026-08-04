/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:37:55
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:37:55
 * @FilePath: \feishu-work\server\src\modules\auth\auth.controller.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * 端内免登（主）：前端调 tt.requestAccess / requestAuthCode 拿到 code 后传给后端
   * 对应 docs/04 3.1
   */
  @Post('feishu/login')
  login(@Body() body: { code: string }) {
    return this.authService.login(body.code);
  }

  /**
   * 临时登录（仅本地调试）：浏览器直接访问时一键以管理员身份登录
   * 仅当环境变量 DEV_LOGIN_ENABLED=1 时开放，生产环境务必关闭
   */
  @Post('dev/login')
  devLogin() {
    return this.authService.devLogin();
  }

  /** 网页授权回调（浏览器直接访问备选，占位） */
  @Get('feishu/callback')
  callback(): { message: string } {
    return { message: '网页授权回调：浏览器访问场景请按 docs/04 3.2 接入' };
  }

  /** 当前用户信息 */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: JwtUser) {
    return this.authService.me(user.openId);
  }
}
