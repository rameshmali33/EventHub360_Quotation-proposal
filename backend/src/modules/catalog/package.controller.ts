import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { PackageService } from './package.service';
import { CreatePackageDto, UpdatePackageDto } from './dto/create-package.dto';
import { CatalogListQueryDto } from './dto/catalog-list-query.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('packages')
@Controller('api/v1/packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new package' })
  @ApiResponse({ status: 201, description: 'Package successfully created.' })
  create(@Body() createDto: CreatePackageDto) {
    return this.packageService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all packages' })
  findAll(@Query() query: CatalogListQueryDto) {
    return this.packageService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific package by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.packageService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a package' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdatePackageDto) {
    return this.packageService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a package' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.packageService.remove(id);
  }
}
