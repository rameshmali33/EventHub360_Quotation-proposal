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
import { RateCardService } from './rate-card.service';
import {
  CreateRateCardDto,
  UpdateRateCardDto,
} from './dto/create-rate-card.dto';
import { CatalogListQueryDto } from './dto/catalog-list-query.dto';

@ApiTags('rate-cards')
@Controller('api/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RateCardController {
  constructor(private readonly rateCardService: RateCardService) {}

  @Post('price-books/:priceBookId/rate-cards')
  @Roles(AppRole.ADMINISTRATOR, AppRole.OWNER, AppRole.MANAGER)
  @ApiOperation({ summary: 'Add a rate card to a price book' })
  @ApiResponse({ status: 201, description: 'Rate card successfully created.' })
  create(
    @Param('priceBookId', ParseIntPipe) id: number,
    @Body() dto: CreateRateCardDto,
  ) {
    return this.rateCardService.create(id, dto);
  }

  @Get('price-books/:priceBookId/rate-cards')
  @Roles(
    AppRole.ADMINISTRATOR,
    AppRole.OWNER,
    AppRole.MANAGER,
    AppRole.EXECUTIVE,
  )
  findAll(
    @Param('priceBookId', ParseIntPipe) id: number,
    @Query() query: CatalogListQueryDto,
  ) {
    return this.rateCardService.findAllByPriceBook(id, query);
  }

  @Get('rate-cards/:id')
  @Roles(
    AppRole.ADMINISTRATOR,
    AppRole.OWNER,
    AppRole.MANAGER,
    AppRole.EXECUTIVE,
  )
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rateCardService.findOne(id);
  }

  @Patch('rate-cards/:id')
  @Roles(AppRole.ADMINISTRATOR, AppRole.OWNER, AppRole.MANAGER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRateCardDto,
  ) {
    return this.rateCardService.update(id, dto);
  }

  @Delete('rate-cards/:id')
  @Roles(AppRole.ADMINISTRATOR, AppRole.OWNER, AppRole.MANAGER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rateCardService.remove(id);
  }
}
