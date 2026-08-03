/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:39:58
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:39:59
 * @FilePath: \feishu-work\server\src\modules\report\dto\update-report.dto.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateReportDto } from './create-report.dto';

export class UpdateReportDto extends PartialType(CreateReportDto) {}
