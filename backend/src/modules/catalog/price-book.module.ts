import { Module } from '@nestjs/common';
import { PriceBookService } from './price-book.service';
import { PriceBookController } from './price-book.controller';
import { RateCardService } from './rate-card.service';
import { RateCardController } from './rate-card.controller';
import { PackageService } from './package.service';
import { PackageController } from './package.controller';

@Module({
  controllers: [PriceBookController, RateCardController, PackageController],
  providers: [PriceBookService, RateCardService, PackageService],
  exports: [PriceBookService, RateCardService, PackageService]
})
export class PriceBookModule {}
