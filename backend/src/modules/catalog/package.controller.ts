import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppRole } from '../../common/auth/roles';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PackageService } from './package.service';
import { CreatePackageDto, UpdatePackageDto } from './dto/create-package.dto';
import { CatalogListQueryDto } from './dto/catalog-list-query.dto';

@ApiTags('packages')
@Controller('api/v1/packages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post()
  @Roles(AppRole.ADMINISTRATOR, AppRole.OWNER, AppRole.MANAGER)
  @ApiOperation({ summary: 'Create a new package' })
  @ApiResponse({ status: 201, description: 'Package successfully created.' })
  create(@Body() dto: CreatePackageDto) {
    return this.packageService.create(dto);
  }

  @Get()
  @Roles(
    AppRole.ADMINISTRATOR,
    AppRole.OWNER,
    AppRole.MANAGER,
    AppRole.EXECUTIVE,
  )
  findAll(@Query() query: CatalogListQueryDto) {
    return this.packageService.findAll(query);
  }

  @Get(':id')
  @Roles(
    AppRole.ADMINISTRATOR,
    AppRole.OWNER,
    AppRole.MANAGER,
    AppRole.EXECUTIVE,
  )
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.packageService.findOne(id);
  }

  @Patch(':id')
  @Roles(AppRole.ADMINISTRATOR, AppRole.OWNER, AppRole.MANAGER)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePackageDto) {
    return this.packageService.update(id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.ADMINISTRATOR, AppRole.OWNER, AppRole.MANAGER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.packageService.remove(id);
  }
}
