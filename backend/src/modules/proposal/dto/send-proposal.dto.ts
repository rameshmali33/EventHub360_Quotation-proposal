import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendProposalDto {
  @ApiProperty({ description: 'Email address of the client to send the proposal to', example: 'client@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ description: 'Optional email cover notes', example: 'Please review the event plan and sign.' })
  @IsString()
  @IsOptional()
  notes?: string;
}
