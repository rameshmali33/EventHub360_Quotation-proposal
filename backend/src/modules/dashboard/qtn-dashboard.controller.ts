import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QtnDashboardService } from './qtn-dashboard.service';

@ApiTags('qtn-dashboard')
@Controller('api/v1/qtn/dashboard')
export class QtnDashboardController {
  constructor(private readonly dashboardService: QtnDashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get high-level QTN dashboard stats' })
  @ApiResponse({ status: 200, description: 'Return stats object.' })
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('monthly-quotations')
  @ApiOperation({ summary: 'Get monthly quotation generation and revenue metrics' })
  @ApiResponse({ status: 200, description: 'Return array of monthly data.' })
  getMonthlyQuotations() {
    return this.dashboardService.getMonthlyQuotations();
  }

  @Get('status-summary')
  @ApiOperation({ summary: 'Get breakdown of quotation status distributions' })
  @ApiResponse({ status: 200, description: 'Return status breakdown and percentages.' })
  getStatusSummary() {
    return this.dashboardService.getStatusSummary();
  }

  @Get('conversion-funnel')
  @ApiOperation({ summary: 'Get sales pipeline conversion funnel metrics' })
  @ApiResponse({ status: 200, description: 'Return funnel steps data.' })
  getConversionFunnel() {
    return this.dashboardService.getConversionFunnel();
  }

  @Get('pending-approvals')
  @ApiOperation({ summary: 'Get details of all quotations currently pending approval' })
  @ApiResponse({ status: 200, description: 'Return list of pending approval items.' })
  getPendingApprovals() {
    return this.dashboardService.getPendingApprovals();
  }

  @Get('recent-quotations')
  @ApiOperation({ summary: 'Get the top 10 most recently created quotations' })
  @ApiResponse({ status: 200, description: 'Return list of recent quotations.' })
  getRecentQuotations() {
    return this.dashboardService.getRecentQuotations();
  }

  @Get('top-sales-executives')
  @ApiOperation({ summary: 'Get quotation performance leaderboard for sales executives' })
  @ApiResponse({ status: 200, description: 'Return sales performance list.' })
  getTopSalesExecutives() {
    return this.dashboardService.getTopSalesExecutives();
  }
}
