import { PartialType } from '@nestjs/swagger';
import { CreateQuotationLineDto } from './create-quotation-line.dto';

export class UpdateQuotationLineDto extends PartialType(CreateQuotationLineDto) {}
