import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApprovalCommentDto {
  @ApiProperty({ description: 'The text content of the comment', example: 'We should offer a smaller discount on packages.' })
  @IsString()
  @IsNotEmpty()
  comment: string;
}

