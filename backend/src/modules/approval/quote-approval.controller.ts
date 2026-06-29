import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { QuoteApprovalService } from './quote-approval.service';
import { RequestApprovalDto } from './dto/request-approval.dto';
import { ApprovalActionDto } from './dto/approval-action.dto';
import { ApprovalCommentDto } from './dto/approval-comment.dto';

@ApiTags('quote-approvals')
@Controller()
export class QuoteApprovalController {
  constructor(private readonly quoteApprovalService: QuoteApprovalService) {}

  @Get('api/v1/quote-approvals')
  @ApiOperation({ summary: 'Get all quote approvals' })
  @ApiResponse({ status: 200, description: 'Return all approvals.' })
  findAll() {
    return this.quoteApprovalService.findAll();
  }

  @Get('api/v1/quote-approvals/:id')
  @ApiOperation({ summary: 'Get a specific quote approval by ID' })
  @ApiParam({ name: 'id', description: 'Approval ID', type: Number })
  @ApiResponse({ status: 200, description: 'Return the approval.' })
  @ApiResponse({ status: 404, description: 'Approval not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.quoteApprovalService.findOne(id);
  }

  @Post('api/v1/quotations/:id/approval')
  @ApiOperation({ summary: 'Request approval for a quotation' })
  @ApiParam({ name: 'id', description: 'Quotation ID', type: Number })
  @ApiResponse({ status: 201, description: 'Approval request successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid request or already has pending request.' })
  @ApiResponse({ status: 404, description: 'Quotation not found.' })
  requestApproval(
    @Param('id', ParseIntPipe) id: number,
    @Body() requestDto: RequestApprovalDto,
  ) {
    // TODO: Implement RBAC - Sales Exec request approval
    return this.quoteApprovalService.requestApproval(id, requestDto);
  }

  @Patch('api/v1/quote-approvals/:id/approve')
  @ApiOperation({ summary: 'Approve a pending quote approval request' })
  @ApiParam({ name: 'id', description: 'Approval ID', type: Number })
  @ApiResponse({ status: 200, description: 'Approval request approved.' })
  @ApiResponse({ status: 400, description: 'Approval request not pending.' })
  @ApiResponse({ status: 404, description: 'Approval not found.' })
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() actionDto: ApprovalActionDto,
  ) {
    // TODO: Implement RBAC - Sales Manager approval OR Company Owner approval
    return this.quoteApprovalService.approve(id, actionDto);
  }

  @Patch('api/v1/quote-approvals/:id/reject')
  @ApiOperation({ summary: 'Reject a pending quote approval request' })
  @ApiParam({ name: 'id', description: 'Approval ID', type: Number })
  @ApiResponse({ status: 200, description: 'Approval request rejected.' })
  @ApiResponse({ status: 400, description: 'Approval request not pending.' })
  @ApiResponse({ status: 404, description: 'Approval not found.' })
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() actionDto: ApprovalActionDto,
  ) {
    // TODO: Implement RBAC - Sales Manager approval OR Company Owner approval
    return this.quoteApprovalService.reject(id, actionDto);
  }

  @Patch('api/v1/quote-approvals/:id/request-changes')
  @ApiOperation({ summary: 'Request changes for a pending quote approval' })
  @ApiParam({ name: 'id', description: 'Approval ID', type: Number })
  @ApiResponse({ status: 200, description: 'Changes requested.' })
  @ApiResponse({ status: 400, description: 'Approval request not pending.' })
  @ApiResponse({ status: 404, description: 'Approval not found.' })
  requestChanges(
    @Param('id', ParseIntPipe) id: number,
    @Body() actionDto: ApprovalActionDto,
  ) {
    // TODO: Implement RBAC - Sales Manager approval OR Company Owner approval
    return this.quoteApprovalService.requestChanges(id, actionDto);
  }

  @Post('api/v1/quote-approvals/:id/comments')
  @ApiOperation({ summary: 'Add a comment to an approval process' })
  @ApiParam({ name: 'id', description: 'Approval ID', type: Number })
  @ApiResponse({ status: 201, description: 'Comment successfully added.' })
  @ApiResponse({ status: 404, description: 'Approval not found.' })
  addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() commentDto: ApprovalCommentDto,
  ) {
    return this.quoteApprovalService.addComment(id, commentDto);
  }

  @Get('api/v1/quote-approvals/:id/history')
  @ApiOperation({ summary: 'Get history of actions on an approval request' })
  @ApiParam({ name: 'id', description: 'Approval ID', type: Number })
  @ApiResponse({ status: 200, description: 'Return history records.' })
  @ApiResponse({ status: 404, description: 'Approval not found.' })
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.quoteApprovalService.getHistory(id);
  }
}
