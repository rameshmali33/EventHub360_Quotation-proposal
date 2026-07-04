import { Module } from '@nestjs/common';
import { CatalogCategoryController } from './catalog-category.controller';
import { CatalogCategoryService } from './catalog-category.service';

@Module({
  controllers: [CatalogCategoryController],
  providers: [CatalogCategoryService],
})
export class CatalogCategoryModule {}
