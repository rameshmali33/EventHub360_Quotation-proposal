import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { RateCardService } from './rate-card.service';
import { CreateRateCardDto, UpdateRateCardDto } from './dto/create-rate-card.dto';
import { CatalogListQueryDto } from './dto/catalog-list-query.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('rate-cards')
@Controller('api/v1')
export class RateCardController {
  constructor(private readonly rateCardService: RateCardService) {}

  @Post('price-books/:priceBookId/rate-cards')
  @ApiOperation({ summary: 'Add a rate card to a price book' })
  @ApiResponse({ status: 201, description: 'Rate card successfully created.' })
  create(
    @Param('priceBookId', ParseIntPipe) priceBookId: number,
    @Body() createDto: CreateRateCardDto,
  ) {
    return this.rateCardService.create(priceBookId, createDto);
  }

  @Get('price-books/:priceBookId/rate-cards')
  @ApiOperation({ summary: 'List rate cards for a price book' })
  findAll(
    @Param('priceBookId', ParseIntPipe) priceBookId: number,
    @Query() query: CatalogListQueryDto,
  ) {
    return this.rateCardService.findAllByPriceBook(priceBookId, query);
  }

  @Get('rate-cards/:id')
  @ApiOperation({ summary: 'Get a specific rate card by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rateCardService.findOne(id);
  }

  @Patch('rate-cards/:id')
  @ApiOperation({ summary: 'Update a rate card' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateRateCardDto) {
    return this.rateCardService.update(id, updateDto);
  }

  @Delete('rate-cards/:id')
  @ApiOperation({ summary: 'Soft delete a rate card' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rateCardService.remove(id);
  }
}
