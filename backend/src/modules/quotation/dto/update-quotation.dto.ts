import { PartialType } from '@nestjs/swagger';
import { CreateQuotationDto } from './create-quotation.dto';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { QuotationStatus } from './create-quotation.dto';

export class UpdateQuotationDto extends PartialType(CreateQuotationDto) {
  @IsEnum(QuotationStatus)
  @IsOptional()
  status?: QuotationStatus;

  @IsString()
  @IsOptional()
  currency?: string;
}
