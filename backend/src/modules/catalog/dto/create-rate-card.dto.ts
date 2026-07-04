import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateRateCardDto {
  @ApiProperty({
    description: 'The rate card item name',
    example: 'Sound System Setup',
  })
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiProperty({
    description: 'Type/Category of the rate card item',
    example: 'AV_EQUIPMENT',
  })
  @IsString()
  @IsNotEmpty()
  itemType: string;

  @ApiProperty({ description: 'Unit of measurement (UOM)', example: 'DAY' })
  @IsString()
  @IsNotEmpty()
  uom: string;

  @ApiPropertyOptional({ description: 'Image URL for the rate card item' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: 'Selling rate per unit', example: 15000 })
  @IsNumber()
  @IsNotEmpty()
  rate: number;

  @ApiProperty({ description: 'Cost price per unit', example: 10000 })
  @IsNumber()
  @IsNotEmpty()
  cost: number;

  @ApiPropertyOptional({
    description: 'Tax percentage applied to this item',
    example: 18,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  taxPercent?: number = 0;

  @ApiPropertyOptional({
    description: 'Active status of the rate card item',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}

export class UpdateRateCardDto extends PartialType(CreateRateCardDto) {}
