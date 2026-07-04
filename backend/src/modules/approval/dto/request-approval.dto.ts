import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RequestApprovalDto {
  @ApiPropertyOptional({
    description: 'Optional notes for the approval request',
    example: 'Standard sales discount applied.',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Optional discount percentage override',
    example: 8,
  })
  @IsNumber()
  @IsOptional()
  discountPercent?: number;
}
