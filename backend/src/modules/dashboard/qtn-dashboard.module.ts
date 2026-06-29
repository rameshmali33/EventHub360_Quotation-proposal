import { Module } from '@nestjs/common';
import { QtnDashboardService } from './qtn-dashboard.service';
import { QtnDashboardController } from './qtn-dashboard.controller';
import { QuotationModule } from '../quotation/quotation.module';
import { QuoteApprovalModule } from '../approval/quote-approval.module';

@Module({
  imports: [QuotationModule, QuoteApprovalModule],
  controllers: [QtnDashboardController],
  providers: [QtnDashboardService],
})
export class QtnDashboardModule {}
