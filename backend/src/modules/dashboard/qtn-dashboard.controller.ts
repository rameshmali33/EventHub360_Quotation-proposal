import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppRole } from '../../common/auth/roles';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { QtnDashboardService } from './qtn-dashboard.service';

@ApiTags('qtn-dashboard')
@Controller('api/v1/qtn/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AppRole.ADMINISTRATOR, AppRole.OWNER, AppRole.MANAGER, AppRole.EXECUTIVE)
export class QtnDashboardController {
  constructor(private readonly service: QtnDashboardService) {}

  private createdBy(request: any) {
    return (request.user.roles || []).includes(AppRole.EXECUTIVE)
      ? Number(request.user.sub)
      : undefined;
  }

  @Get('stats')
  getStats(@Req() request: any) {
    return this.service.getStats(this.createdBy(request));
  }

  @Get('monthly-quotations')
  getMonthlyQuotations(@Req() request: any, @Query('months') months?: string) {
    return this.service.getMonthlyQuotations(
      this.createdBy(request),
      Number(months) || 12,
    );
  }

  @Get('status-summary')
  getStatusSummary(@Req() request: any) {
    return this.service.getStatusSummary(this.createdBy(request));
  }

  @Get('conversion-funnel')
  getConversionFunnel(@Req() request: any) {
    return this.service.getConversionFunnel(this.createdBy(request));
  }

  @Get('pending-approvals')
  getPendingApprovals(@Req() request: any) {
    return this.service.getPendingApprovals(this.createdBy(request));
  }

  @Get('recent-quotations')
  getRecentQuotations(@Req() request: any) {
    return this.service.getRecentQuotations(this.createdBy(request));
  }

  @Get('top-sales-executives')
  getTopSalesExecutives(@Req() request: any) {
    return this.service.getTopSalesExecutives(this.createdBy(request));
  }
}
