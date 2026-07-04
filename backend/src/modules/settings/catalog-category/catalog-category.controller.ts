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
  CreateCatalogCategoryDto,
  UpdateCatalogCategoryDto,
} from './catalog-category.dto';
import { CatalogCategoryService } from './catalog-category.service';

@ApiTags('catalog-categories')
@Controller('api/v1/catalog-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CatalogCategoryController {
  constructor(
    private readonly catalogCategoryService: CatalogCategoryService,
  ) {}

  @Get()
  @Roles(
    AppRole.ADMINISTRATOR,
    AppRole.OWNER,
    AppRole.MANAGER,
    AppRole.EXECUTIVE,
  )
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.catalogCategoryService.findAll(includeInactive === 'true');
  }

  @Post()
  @Roles(AppRole.ADMINISTRATOR, AppRole.OWNER, AppRole.MANAGER)
  create(@Body() dto: CreateCatalogCategoryDto) {
    return this.catalogCategoryService.create(dto);
  }

  @Patch(':id')
  @Roles(AppRole.ADMINISTRATOR, AppRole.OWNER, AppRole.MANAGER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCatalogCategoryDto,
  ) {
    return this.catalogCategoryService.update(id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.ADMINISTRATOR, AppRole.OWNER, AppRole.MANAGER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.catalogCategoryService.remove(id);
  }
}
