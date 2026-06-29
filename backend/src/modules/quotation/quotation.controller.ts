import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { QuotationService } from './quotation.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { QuotationListQueryDto } from './dto/quotation-list-query.dto';
import { CreateQuotationLineDto } from './dto/create-quotation-line.dto';
import { UpdateQuotationLineDto } from './dto/update-quotation-line.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('quotations')
@Controller('api/v1/quotations')
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quotation' })
  @ApiResponse({ status: 201, description: 'Quotation successfully created.' })
  create(@Body() createQuotationDto: CreateQuotationDto) {
    return this.quotationService.create(createQuotationDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all quotations' })
  findAll(@Query() query: QuotationListQueryDto) {
    return this.quotationService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific quotation by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.quotationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a quotation' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateQuotationDto: UpdateQuotationDto) {
    return this.quotationService.update(id, updateQuotationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a quotation' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.quotationService.remove(id);
  }

  @Post(':id/lines')
  @ApiOperation({ summary: 'Add a line to a quotation' })
  addLine(@Param('id', ParseIntPipe) id: number, @Body() lineDto: CreateQuotationLineDto) {
    return this.quotationService.addLine(id, lineDto);
  }

  @Patch(':id/lines/:lineId')
  @ApiOperation({ summary: 'Update a specific quotation line' })
  updateLine(
    @Param('id', ParseIntPipe) id: number,
    @Param('lineId', ParseIntPipe) lineId: number,
    @Body() updateLineDto: UpdateQuotationLineDto,
  ) {
    return this.quotationService.updateLine(id, lineId, updateLineDto);
  }

  @Delete(':id/lines/:lineId')
  @ApiOperation({ summary: 'Soft delete a quotation line' })
  removeLine(
    @Param('id', ParseIntPipe) id: number,
    @Param('lineId', ParseIntPipe) lineId: number,
  ) {
    return this.quotationService.removeLine(id, lineId);
  }

  @Post(':id/calculate')
  @ApiOperation({ summary: 'Calculate quotation pricing and update totals' })
  calculate(@Param('id', ParseIntPipe) id: number) {
    return this.quotationService.calculate(id);
  }
}
