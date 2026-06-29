import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreatePackageDto {
  @ApiProperty({ description: 'The unique human-readable name of the package', example: 'Premium Wedding Stage Set' })
  @IsString()
  @IsNotEmpty()
  packageName: string;

  @ApiProperty({ description: 'A short alphanumeric code representing the package', example: 'PKG-STAGE-PREM' })
  @IsString()
  @IsNotEmpty()
  packageCode: string;

  @ApiPropertyOptional({ description: 'Detailed description of package services and scope', example: 'Includes flowers, LED lighting, backdrops, and sofa.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Base selling price of the package', example: 120000 })
  @IsNumber()
  @IsNotEmpty()
  basePrice: number;

  @ApiPropertyOptional({ description: 'List of individual service tags or items included', type: [String], example: ['LED Stage Backdrop', 'Royal Stage Sofa', 'Floral Arch Setup'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  includedServices?: string[];

  @ApiPropertyOptional({ description: 'Active status of the package', example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}

export class UpdatePackageDto extends PartialType(CreatePackageDto) {}
