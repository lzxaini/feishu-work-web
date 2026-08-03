/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:39:56
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:39:57
 * @FilePath: \feishu-work\server\src\modules\report\dto\create-report.dto.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateReportDto {
  @IsInt()
  @Type(() => Number)
  projectId: number;

  @IsDateString()
  reportDate: string;

  /** 普通时长（小时） */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(24)
  normalHours?: number;

  /** 加班时长（小时，>0 走审批） */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(24)
  overtimeHours?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}
