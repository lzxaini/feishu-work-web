/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:36:42
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:36:42
 * @FilePath: \feishu-work\server\src\main.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  // 开发期允许跨域（前端 Vite 或飞书内）
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true } }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 feishu-work server running at http://localhost:${port}/api`);
}
bootstrap();
