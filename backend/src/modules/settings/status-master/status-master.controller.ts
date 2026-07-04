import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppRole } from '../../../common/auth/roles';
import { Roles } from '../../../common/auth/roles.decorator';
import { RolesGuard } from '../../../common/auth/roles.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import {
  CreateStatusMasterDto,
  UpdateStatusMasterDto,
} from './status-master.dto';
import { StatusMasterService } from './status-master.service';

@ApiTags('quotation-statuses')
@Controller('api/v1/quotation-statuses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatusMasterController {
  constructor(private readonly statusMasterService: StatusMasterService) {}

  @Get()
  @Roles(
    AppRole.ADMINISTRATOR,
    AppRole.OWNER,
    AppRole.MANAGER,
    AppRole.EXECUTIVE,
    AppRole.FINANCE,
    AppRole.EVENT_MANAGER,
    AppRole.AUDITOR,
  )
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.statusMasterService.findAll(includeInactive === 'true');
  }

  @Post()
  @Roles(AppRole.ADMINISTRATOR)
  create(@Body() dto: CreateStatusMasterDto) {
    return this.statusMasterService.create(dto);
  }

  @Patch(':id')
  @Roles(AppRole.ADMINISTRATOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusMasterDto,
  ) {
    return this.statusMasterService.update(id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.ADMINISTRATOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.statusMasterService.remove(id);
  }
}
