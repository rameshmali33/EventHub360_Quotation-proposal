import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProposalDto {
  @ApiProperty({
    description: 'ID of the quotation associated with the proposal',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  quotationId: number;
}
