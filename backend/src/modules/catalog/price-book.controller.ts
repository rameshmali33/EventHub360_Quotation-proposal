import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { PriceBookService } from './price-book.service';
import { CreatePriceBookDto, UpdatePriceBookDto } from './dto/create-price-book.dto';
import { CatalogListQueryDto } from './dto/catalog-list-query.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('price-books')
@Controller('api/v1/price-books')
export class PriceBookController {
  constructor(private readonly priceBookService: PriceBookService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new price book' })
  @ApiResponse({ status: 201, description: 'Price book successfully created.' })
  create(@Body() createDto: CreatePriceBookDto) {
    return this.priceBookService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all price books' })
  findAll(@Query() query: CatalogListQueryDto) {
    return this.priceBookService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific price book by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.priceBookService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a price book' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdatePriceBookDto) {
    return this.priceBookService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a price book' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.priceBookService.remove(id);
  }
}
