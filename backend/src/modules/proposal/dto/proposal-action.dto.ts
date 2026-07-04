import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProposalActionDto {
  @ApiPropertyOptional({
    description:
      'Optional reason for the proposal action (e.g. why it was rejected)',
    example: 'Price exceeds budget limit.',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
