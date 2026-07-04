import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export const STATUS_COLORS = [
  'gray',
  'amber',
  'indigo',
  'emerald',
  'blue',
  'red',
  'orange',
  'purple',
] as const;

export class CreateStatusMasterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[A-Za-z][A-Za-z0-9_]*$/, {
    message: 'code must contain only letters, numbers, and underscores',
  })
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  label: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(STATUS_COLORS)
  @IsOptional()
  color?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateStatusMasterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(STATUS_COLORS)
  @IsOptional()
  color?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
