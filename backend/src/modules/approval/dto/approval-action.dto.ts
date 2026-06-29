import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApprovalActionDto {
  @ApiPropertyOptional({ description: 'Reason for the approval action (e.g. why it was rejected or requested changes)', example: 'Margin is too low.' })
  @IsString()
  @IsOptional()
  reason?: string;
}

