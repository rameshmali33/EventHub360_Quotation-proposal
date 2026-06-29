import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LeadService } from './lead.service';

@ApiTags('leads')
@Controller('api/v1/leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post()
  @ApiOperation({ summary: 'Create or reuse a lead for quotation creation' })
  create(@Body('name') name: string) {
    return this.leadService.create(name);
  }

  @Get()
  @ApiOperation({ summary: 'Search active leads for client autocomplete' })
  @ApiQuery({ name: 'search', required: false })
  search(@Query('search') search = '') {
    return this.leadService.search(search);
  }
}
