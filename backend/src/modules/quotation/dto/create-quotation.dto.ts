import { IsInt, IsNotEmpty, IsOptional, IsString, IsDateString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateQuotationLineDto } from './create-quotation-line.dto';

export enum QuotationStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
}

export class CreateQuotationDto {
  @ApiProperty({ description: 'The associated lead ID', example: 12 })
  @IsInt()
  @IsNotEmpty()
  lead_id: number | bigint;

  @ApiPropertyOptional({ description: 'The currency code', example: 'INR', default: 'INR' })
  @IsString()
  @IsOptional()
  currency?: string = 'INR';

  @ApiPropertyOptional({ description: 'Expiration date of the quotation', example: '2026-07-31T23:59:59.000Z' })
  @IsDateString()
  @IsOptional()
  expires_at?: string;

  @ApiPropertyOptional({ description: 'Parent quotation ID for version comparisons', example: 1 })
  @IsInt()
  @IsOptional()
  parent_quotation_id?: number | bigint;

  @ApiPropertyOptional({ description: 'Array of quotation lines', type: [CreateQuotationLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuotationLineDto)
  @IsOptional()
  lines?: CreateQuotationLineDto[];
}
