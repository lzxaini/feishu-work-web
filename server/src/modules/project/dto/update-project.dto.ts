/*
 * @Author: lzx 1245634367@qq.com
 * @Date: 2026-08-03 22:38:57
 * @LastEditors: lzx 1245634367@qq.com
 * @LastEditTime: 2026-08-03 22:38:58
 * @FilePath: \feishu-work\server\src\modules\project\dto\update-project.dto.ts
 * @Description: Fuck Bug
 * 微信：lizx2066
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
