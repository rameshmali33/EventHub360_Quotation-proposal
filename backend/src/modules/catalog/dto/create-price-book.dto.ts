import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreatePriceBookDto {
  @ApiProperty({
    description: 'The price book name',
    example: 'Standard FY2026 Price List',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'The ISO date price book validity begins',
    example: '2026-04-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @ApiPropertyOptional({
    description: 'The ISO date price book validity ends',
    example: '2027-03-31T23:59:59.000Z',
  })
  @IsDateString()
  @IsOptional()
  validTo?: string;

  @ApiPropertyOptional({
    description: 'Active status of price book',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}

export class UpdatePriceBookDto extends PartialType(CreatePriceBookDto) {}
