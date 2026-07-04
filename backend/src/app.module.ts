import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PricingModule } from './modules/pricing/pricing.module';
import { QuotationModule } from './modules/quotation/quotation.module';
import { PriceBookModule } from './modules/catalog/price-book.module';
import { QuoteApprovalModule } from './modules/approval/quote-approval.module';
import { ProposalModule } from './modules/proposal/proposal.module';
import { QtnDashboardModule } from './modules/dashboard/qtn-dashboard.module';
import { PrismaModule } from './prisma/prisma.module';
import { LeadModule } from './modules/leads/lead.module';
import { AuthModule } from './modules/auth/auth.module';
import { StatusMasterModule } from './modules/settings/status-master/status-master.module';
import { CatalogCategoryModule } from './modules/settings/catalog-category/catalog-category.module';

@Module({
  imports: [
    PrismaModule,
    PricingModule,
    QuotationModule,
    PriceBookModule,
    QuoteApprovalModule,
    ProposalModule,
    QtnDashboardModule,
    LeadModule,
    AuthModule,
    StatusMasterModule,
    CatalogCategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
