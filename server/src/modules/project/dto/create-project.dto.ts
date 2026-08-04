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
import { IsArray, IsDateString, IsInt, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

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
  @IsInt()
  @Type(() => Number)
  priority?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  /** 日期（合同/立项日期） */
  @IsOptional()
  @IsDateString()
  contractDate?: string;

  /** 合同编号 */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contractNo?: string;

  /** 研发项目书 */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  rdProjectDoc?: string;

  /** 合同金额 */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  contractAmount?: number;

  /** 备注 */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;

  /** 申请专利 0否 1是 */
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  patentApplied?: number;

  /** 研发费用摊销 */
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rdCostAmortization?: number;

  /** 负责人（指定用户）open_id 列表 */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ownerOpenIds?: string[];
}
