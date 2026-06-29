import { Controller, Get, Post, Body, Param, ParseIntPipe, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import * as express from 'express';
import { ProposalService } from './proposal.service';
import { SendProposalDto } from './dto/send-proposal.dto';
import { ProposalSignatureDto } from './dto/proposal-signature.dto';
import { ProposalActionDto } from './dto/proposal-action.dto';

@ApiTags('proposals')
@Controller()
export class ProposalController {
  constructor(private readonly proposalService: ProposalService) {}

  // ==========================================
  // Internal Proposal APIs
  // ==========================================

  @Get('api/v1/proposals')
  @ApiOperation({ summary: 'Get all generated proposals' })
  @ApiResponse({ status: 200, description: 'Return generated proposals.' })
  findAll() {
    return this.proposalService.findAll();
  }
  @Post('api/v1/quotations/:id/proposal')
  @ApiOperation({ summary: 'Generate a proposal for a quotation' })
  @ApiParam({ name: 'id', description: 'Quotation ID', type: Number })
  @ApiResponse({ status: 201, description: 'Proposal successfully created.' })
  @ApiResponse({ status: 404, description: 'Quotation not found.' })
  createProposal(@Param('id', ParseIntPipe) quotationId: number) {
    return this.proposalService.create(quotationId);
  }

  @Get('api/v1/quotations/:id/proposal')
  @ApiOperation({ summary: 'Get the proposal associated with a quotation' })
  @ApiParam({ name: 'id', description: 'Quotation ID', type: Number })
  @ApiResponse({ status: 200, description: 'Return proposal details.' })
  @ApiResponse({ status: 404, description: 'Proposal not found.' })
  getProposal(@Param('id', ParseIntPipe) quotationId: number) {
    return this.proposalService.findOneByQuotationId(quotationId);
  }

  @Post('api/v1/quotations/:id/send-to-client')
  @ApiOperation({ summary: 'Send the proposal to the client' })
  @ApiParam({ name: 'id', description: 'Quotation ID', type: Number })
  @ApiResponse({ status: 200, description: 'Proposal successfully marked as sent.' })
  @ApiResponse({ status: 400, description: 'Proposal cannot be sent (already sent or wrong status).' })
  @ApiResponse({ status: 404, description: 'Proposal not found.' })
  sendProposal(
    @Param('id', ParseIntPipe) quotationId: number,
    @Body() sendDto: SendProposalDto,
  ) {
    return this.proposalService.send(quotationId, sendDto);
  }

  // ==========================================
  // Public Client APIs
  // ==========================================

  @Get('api/v1/proposals/public/:publicHash')
  @ApiOperation({ summary: 'Fetch public details of a proposal by public hash' })
  @ApiParam({ name: 'publicHash', description: 'Secure public hash of the proposal' })
  @ApiResponse({ status: 200, description: 'Returns proposal details, quotation metrics, and signature.' })
  @ApiResponse({ status: 404, description: 'Proposal not found.' })
  getPublicProposal(@Param('publicHash') publicHash: string, @Req() req: express.Request) {
    // Automatically record a view when the proposal details page is loaded
    const ipAddress = req.ip || '127.0.0.1';
    this.proposalService.recordView(publicHash, ipAddress);
    return this.proposalService.findByHash(publicHash);
  }

  @Post('api/v1/proposals/public/:publicHash/view')
  @ApiOperation({ summary: 'Log a view on the proposal' })
  @ApiParam({ name: 'publicHash', description: 'Secure public hash of the proposal' })
  @ApiResponse({ status: 201, description: 'View logged successfully.' })
  @ApiResponse({ status: 404, description: 'Proposal not found.' })
  logView(@Param('publicHash') publicHash: string, @Req() req: express.Request) {
    const ipAddress = req.ip || '127.0.0.1';
    return this.proposalService.recordView(publicHash, ipAddress);
  }

  @Post('api/v1/proposals/public/:publicHash/sign')
  @ApiOperation({ summary: 'Sign the proposal publicly' })
  @ApiParam({ name: 'publicHash', description: 'Secure public hash of the proposal' })
  @ApiResponse({ status: 201, description: 'Signature details saved.' })
  @ApiResponse({ status: 400, description: 'Proposal is read-only or invalid.' })
  @ApiResponse({ status: 404, description: 'Proposal not found.' })
  signProposal(
    @Param('publicHash') publicHash: string,
    @Body() signatureDto: ProposalSignatureDto,
    @Req() req: express.Request,
  ) {
    const ipAddress = req.ip || '127.0.0.1';
    return this.proposalService.sign(publicHash, signatureDto, ipAddress);
  }

  @Post('api/v1/proposals/public/:publicHash/accept')
  @ApiOperation({ summary: 'Accept the proposal publicly' })
  @ApiParam({ name: 'publicHash', description: 'Secure public hash of the proposal' })
  @ApiResponse({ status: 201, description: 'Proposal accepted.' })
  @ApiResponse({ status: 400, description: 'Acceptance failed (missing signature, not viewed, or already accepted/rejected).' })
  @ApiResponse({ status: 404, description: 'Proposal not found.' })
  acceptProposal(@Param('publicHash') publicHash: string, @Req() req: express.Request) {
    const ipAddress = req.ip || '127.0.0.1';
    return this.proposalService.accept(publicHash, ipAddress);
  }

  @Post('api/v1/proposals/public/:publicHash/reject')
  @ApiOperation({ summary: 'Reject the proposal publicly' })
  @ApiParam({ name: 'publicHash', description: 'Secure public hash of the proposal' })
  @ApiResponse({ status: 201, description: 'Proposal rejected.' })
  @ApiResponse({ status: 400, description: 'Rejection failed (already accepted/rejected).' })
  @ApiResponse({ status: 404, description: 'Proposal not found.' })
  rejectProposal(
    @Param('publicHash') publicHash: string,
    @Body() actionDto: ProposalActionDto,
    @Req() req: express.Request,
  ) {
    const ipAddress = req.ip || '127.0.0.1';
    return this.proposalService.reject(publicHash, actionDto, ipAddress);
  }
}
