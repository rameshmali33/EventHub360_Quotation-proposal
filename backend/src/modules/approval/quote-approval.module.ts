import { Module } from '@nestjs/common';
import { QuoteApprovalService } from './quote-approval.service';
import { QuoteApprovalController } from './quote-approval.controller';
import { QuotationModule } from '../quotation/quotation.module';

@Module({
  imports: [QuotationModule],
  controllers: [QuoteApprovalController],
  providers: [QuoteApprovalService],
  exports: [QuoteApprovalService],
})
export class QuoteApprovalModule {}
