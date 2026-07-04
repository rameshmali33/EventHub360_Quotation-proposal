import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AppRole } from '../../common/auth/roles';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LeadService } from './lead.service';

@ApiTags('leads')
@Controller('api/v1/leads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AppRole.ADMINISTRATOR, AppRole.OWNER, AppRole.MANAGER, AppRole.EXECUTIVE)
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
