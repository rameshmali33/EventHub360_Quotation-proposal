import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuotationLineDto {
  @ApiProperty({
    description: 'The line item type (e.g. PACKAGE, RATE_CARD, CUSTOM)',
    example: 'PACKAGE',
  })
  @IsString()
  @IsNotEmpty()
  item_type: string; // 'PACKAGE', 'RATE_CARD', 'CUSTOM'

  @ApiProperty({
    description: 'Referenced package or rate card ID',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  ref_id: number | bigint;

  @ApiProperty({
    description: 'Description of the service or package line',
    example: 'Gold Wedding Stage Setup',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Quantity of items', example: 1 })
  @IsInt()
  @IsNotEmpty()
  qty: number;

  @ApiProperty({ description: 'Unit selling rate', example: 5000 })
  @IsNumber()
  @IsNotEmpty()
  rate: number;

  @ApiProperty({ description: 'Unit cost price', example: 3500 })
  @IsNumber()
  @IsNotEmpty()
  cost: number;

  @ApiPropertyOptional({ description: 'Associated tax rule ID', example: 1 })
  @IsInt()
  @IsOptional()
  tax_rule_id?: number | bigint;
}
