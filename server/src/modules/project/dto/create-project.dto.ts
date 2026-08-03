/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:38:55
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:38:55
 * @FilePath: \feishu-work\server\src\modules\project\dto\create-project.dto.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  status?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  /** 负责人（指定用户）open_id 列表 */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ownerOpenIds?: string[];
}
