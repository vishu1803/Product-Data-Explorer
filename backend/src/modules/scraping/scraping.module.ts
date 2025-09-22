import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScrapingController } from './scraping.controller';
import { ScrapingService } from './scraping.service';
import { Category } from '../categories/category.entity';
import { Product } from '../products/product.entity';
import { ProductReview } from '../products/product-review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Product, ProductReview])],
  controllers: [ScrapingController],
  providers: [ScrapingService],
  exports: [ScrapingService],
})
export class ScrapingModule {}
