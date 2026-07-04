import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppRole } from '../../common/auth/roles';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CreateQuotationDto,
  QuotationStatus,
} from './dto/create-quotation.dto';
import { CreateQuotationLineDto } from './dto/create-quotation-line.dto';
import { QuotationListQueryDto } from './dto/quotation-list-query.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { UpdateQuotationLineDto } from './dto/update-quotation-line.dto';
import { QuotationAccessScope, QuotationService } from './quotation.service';

const QUOTE_VIEW_ROLES = [
  AppRole.ADMINISTRATOR,
  AppRole.OWNER,
  AppRole.MANAGER,
  AppRole.EXECUTIVE,
  AppRole.FINANCE,
  AppRole.EVENT_MANAGER,
  AppRole.AUDITOR,
];

const QUOTE_EDIT_ROLES = [
  AppRole.ADMINISTRATOR,
  AppRole.OWNER,
  AppRole.MANAGER,
  AppRole.EXECUTIVE,
];

@ApiTags('quotations')
@Controller('api/v1/quotations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  private accessScope(request: any): QuotationAccessScope {
    const roles: AppRole[] = request.user.roles || [];
    if (roles.includes(AppRole.EXECUTIVE))
      return { createdBy: Number(request.user.sub) };
    if (roles.includes(AppRole.EVENT_MANAGER)) return { wonOnly: true };
    return {};
  }

  private async assertDraftEdit(id: number, request: any) {
    const quotation = await this.quotationService.findOne(
      id,
      this.accessScope(request),
    );
    if (
      quotation.status !== QuotationStatus.DRAFT &&
      quotation.status !== QuotationStatus.CHANGES_REQUESTED
    ) {
      throw new ForbiddenException('Only draft quotations can be edited');
    }
  }

  @Post()
  @Roles(...QUOTE_EDIT_ROLES)
  @ApiOperation({ summary: 'Create a new quotation' })
  @ApiResponse({ status: 201, description: 'Quotation successfully created.' })
  create(@Body() dto: CreateQuotationDto, @Req() request: any) {
    return this.quotationService.create(dto, Number(request.user.sub));
  }

  @Get()
  @Roles(...QUOTE_VIEW_ROLES)
  findAll(@Query() query: QuotationListQueryDto, @Req() request: any) {
    return this.quotationService.findAll(query, this.accessScope(request));
  }

  @Get(':id')
  @Roles(...QUOTE_VIEW_ROLES)
  findOne(@Param('id', ParseIntPipe) id: number, @Req() request: any) {
    return this.quotationService.findOne(id, this.accessScope(request));
  }

  @Patch(':id')
  @Roles(...QUOTE_EDIT_ROLES)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuotationDto,
    @Req() request: any,
  ) {
    await this.assertDraftEdit(id, request);
    return this.quotationService.update(id, dto);
  }

  @Delete(':id')
  @Roles(...QUOTE_EDIT_ROLES)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() request: any) {
    await this.assertDraftEdit(id, request);
    return this.quotationService.remove(id);
  }

  @Post(':id/lines')
  @Roles(...QUOTE_EDIT_ROLES)
  async addLine(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateQuotationLineDto,
    @Req() request: any,
  ) {
    await this.assertDraftEdit(id, request);
    return this.quotationService.addLine(id, dto);
  }

  @Patch(':id/lines/:lineId')
  @Roles(...QUOTE_EDIT_ROLES)
  async updateLine(
    @Param('id', ParseIntPipe) id: number,
    @Param('lineId', ParseIntPipe) lineId: number,
    @Body() dto: UpdateQuotationLineDto,
    @Req() request: any,
  ) {
    await this.assertDraftEdit(id, request);
    return this.quotationService.updateLine(id, lineId, dto);
  }

  @Delete(':id/lines/:lineId')
  @Roles(...QUOTE_EDIT_ROLES)
  async removeLine(
    @Param('id', ParseIntPipe) id: number,
    @Param('lineId', ParseIntPipe) lineId: number,
    @Req() request: any,
  ) {
    await this.assertDraftEdit(id, request);
    return this.quotationService.removeLine(id, lineId);
  }

  @Post(':id/calculate')
  @Roles(...QUOTE_EDIT_ROLES)
  async calculate(@Param('id', ParseIntPipe) id: number, @Req() request: any) {
    await this.assertDraftEdit(id, request);
    return this.quotationService.calculate(id);
  }
}
