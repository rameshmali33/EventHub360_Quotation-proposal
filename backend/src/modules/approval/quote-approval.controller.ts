import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AppRole } from '../../common/auth/roles';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { QuotationService } from '../quotation/quotation.service';
import { QuoteApprovalService } from './quote-approval.service';
import { ApprovalActionDto } from './dto/approval-action.dto';
import { ApprovalCommentDto } from './dto/approval-comment.dto';
import { RequestApprovalDto } from './dto/request-approval.dto';

const APPROVER_ROLES = [AppRole.ADMINISTRATOR, AppRole.OWNER, AppRole.MANAGER];

@ApiTags('quote-approvals')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuoteApprovalController {
  constructor(
    private readonly service: QuoteApprovalService,
    private readonly quotationService: QuotationService,
  ) {}

  private async assertRequestAccess(quotationId: number, request: any) {
    const roles: AppRole[] = request.user.roles || [];
    if (roles.includes(AppRole.EXECUTIVE)) {
      await this.quotationService.findOne(quotationId, {
        createdBy: Number(request.user.sub),
      });
    }
  }

  private async assertApprovalTier(approvalId: number, request: any) {
    const roles: AppRole[] = request.user.roles || [];
    if (roles.includes(AppRole.ADMINISTRATOR) || roles.includes(AppRole.OWNER))
      return;
    const approval = await this.service.findOne(approvalId);
    if (approval.required_role === 'Company Owner') {
      throw new ForbiddenException(
        'Tier 3 discounts require Company Owner approval',
      );
    }
  }

  @Get('api/v1/quote-approvals')
  @Roles(...APPROVER_ROLES)
  findAll() {
    return this.service.findAll();
  }

  @Get('api/v1/quote-approvals/:id')
  @Roles(...APPROVER_ROLES)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post('api/v1/quotations/:id/approval')
  @Roles(
    AppRole.ADMINISTRATOR,
    AppRole.OWNER,
    AppRole.MANAGER,
    AppRole.EXECUTIVE,
  )
  @ApiOperation({ summary: 'Request approval for a quotation' })
  @ApiParam({ name: 'id', type: Number })
  async requestApproval(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RequestApprovalDto,
    @Req() request: any,
  ) {
    await this.assertRequestAccess(id, request);
    return this.service.requestApproval(id, dto);
  }

  @Patch('api/v1/quote-approvals/:id/approve')
  @Roles(...APPROVER_ROLES)
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApprovalActionDto,
    @Req() request: any,
  ) {
    await this.assertApprovalTier(id, request);
    return this.service.approve(id, dto);
  }

  @Patch('api/v1/quote-approvals/:id/reject')
  @Roles(...APPROVER_ROLES)
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApprovalActionDto,
    @Req() request: any,
  ) {
    await this.assertApprovalTier(id, request);
    return this.service.reject(id, dto);
  }

  @Patch('api/v1/quote-approvals/:id/request-changes')
  @Roles(...APPROVER_ROLES)
  async requestChanges(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApprovalActionDto,
    @Req() request: any,
  ) {
    await this.assertApprovalTier(id, request);
    return this.service.requestChanges(id, dto);
  }

  @Post('api/v1/quote-approvals/:id/comments')
  @Roles(...APPROVER_ROLES)
  addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApprovalCommentDto,
  ) {
    return this.service.addComment(id, dto);
  }

  @Get('api/v1/quote-approvals/:id/history')
  @Roles(...APPROVER_ROLES)
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.service.getHistory(id);
  }
}
