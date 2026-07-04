import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProposalSignatureDto {
  @ApiProperty({ description: 'Full name of the signer', example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  signerName: string;

  @ApiProperty({
    description:
      'Signature details/representation (base64 or canvas coordinates)',
    example: 'data:image/png;base64,...',
  })
  @IsString()
  @IsNotEmpty()
  signatureData: string;

  @ApiPropertyOptional({
    description: 'Optional IP address override',
    example: '192.168.1.1',
  })
  @IsString()
  @IsOptional()
  ipAddress?: string;
}
