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
import { PriceBookService } from './price-book.service';
import {
  CreatePriceBookDto,
  UpdatePriceBookDto,
} from './dto/create-price-book.dto';
import { CatalogListQueryDto } from './dto/catalog-list-query.dto';

@ApiTags('price-books')
@Controller('api/v1/price-books')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PriceBookController {
  constructor(private readonly priceBookService: PriceBookService) {}

  @Post()
  @Roles(AppRole.ADMINISTRATOR, AppRole.OWNER, AppRole.MANAGER)
  @ApiOperation({ summary: 'Create a new price book' })
  @ApiResponse({ status: 201, description: 'Price book successfully created.' })
  create(@Body() dto: CreatePriceBookDto) {
    return this.priceBookService.create(dto);
  }

  @Get()
  @Roles(
    AppRole.ADMINISTRATOR,
    AppRole.OWNER,
    AppRole.MANAGER,
    AppRole.EXECUTIVE,
  )
  findAll(@Query() query: CatalogListQueryDto) {
    return this.priceBookService.findAll(query);
  }

  @Get(':id')
  @Roles(
    AppRole.ADMINISTRATOR,
    AppRole.OWNER,
    AppRole.MANAGER,
    AppRole.EXECUTIVE,
  )
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.priceBookService.findOne(id);
  }

  @Patch(':id')
  @Roles(AppRole.ADMINISTRATOR, AppRole.OWNER, AppRole.MANAGER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePriceBookDto,
  ) {
    return this.priceBookService.update(id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.ADMINISTRATOR, AppRole.OWNER, AppRole.MANAGER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.priceBookService.remove(id);
  }
}
