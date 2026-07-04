import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { AppRole } from '../../common/auth/roles';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { QuotationStatus } from '../quotation/dto/create-quotation.dto';
import { QuotationService } from '../quotation/quotation.service';
import { ProposalActionDto } from './dto/proposal-action.dto';
import { ProposalSignatureDto } from './dto/proposal-signature.dto';
import { SendProposalDto } from './dto/send-proposal.dto';
import { ProposalService } from './proposal.service';

const PROPOSAL_ROLES = [
  AppRole.ADMINISTRATOR,
  AppRole.OWNER,
  AppRole.MANAGER,
  AppRole.EXECUTIVE,
];

@ApiTags('proposals')
@Controller()
export class ProposalController {
  constructor(
    private readonly service: ProposalService,
    private readonly quotationService: QuotationService,
  ) {}

  private isExecutive(request: any) {
    return (request.user.roles || []).includes(AppRole.EXECUTIVE);
  }

  private async assertQuotationAccess(
    id: number,
    request: any,
    sending = false,
  ) {
    const quotation = await this.quotationService.findOne(
      id,
      this.isExecutive(request) ? { createdBy: Number(request.user.sub) } : {},
    );
    if (sending && quotation.status !== QuotationStatus.APPROVED) {
      throw new ForbiddenException(
        'Sales Executives can send only approved quotations',
      );
    }
    return quotation;
  }

  @Get('api/v1/proposals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PROPOSAL_ROLES)
  findAll(@Req() request: any) {
    return this.service.findAll(
      this.isExecutive(request) ? Number(request.user.sub) : undefined,
    );
  }

  @Post('api/v1/quotations/:id/proposal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PROPOSAL_ROLES)
  async createProposal(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: any,
  ) {
    await this.assertQuotationAccess(id, request);
    return this.service.create(id);
  }

  @Get('api/v1/quotations/:id/proposal')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PROPOSAL_ROLES)
  async getProposal(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: any,
  ) {
    await this.assertQuotationAccess(id, request);
    return this.service.findOneByQuotationId(id);
  }

  @Post('api/v1/quotations/:id/send-to-client')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PROPOSAL_ROLES)
  async sendProposal(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SendProposalDto,
    @Req() request: any,
  ) {
    await this.assertQuotationAccess(id, request, true);
    return this.service.send(id, dto);
  }

  @Get('api/v1/proposals/public/:publicHash')
  @ApiOperation({
    summary: 'Fetch public details of a proposal by public hash',
  })
  async getPublicProposal(
    @Param('publicHash') hash: string,
    @Req() req: express.Request,
  ) {
    const proposal = await this.service.findByHash(hash);
    await this.service.recordView(hash, req.ip || '127.0.0.1');
    return proposal;
  }

  @Post('api/v1/proposals/public/:publicHash/view')
  logView(@Param('publicHash') hash: string, @Req() req: express.Request) {
    return this.service.recordView(hash, req.ip || '127.0.0.1');
  }

  @Post('api/v1/proposals/public/:publicHash/sign')
  signProposal(
    @Param('publicHash') hash: string,
    @Body() dto: ProposalSignatureDto,
    @Req() req: express.Request,
  ) {
    return this.service.sign(hash, dto, req.ip || '127.0.0.1');
  }

  @Post('api/v1/proposals/public/:publicHash/accept')
  acceptProposal(
    @Param('publicHash') hash: string,
    @Req() req: express.Request,
  ) {
    return this.service.accept(hash, req.ip || '127.0.0.1');
  }

  @Post('api/v1/proposals/public/:publicHash/reject')
  rejectProposal(
    @Param('publicHash') hash: string,
    @Body() dto: ProposalActionDto,
    @Req() req: express.Request,
  ) {
    return this.service.reject(hash, dto, req.ip || '127.0.0.1');
  }
}
