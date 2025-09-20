import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAll(page: number = 1, limit: number = 20): Promise<{ products: Product[], total: number }> {
    const [products, total] = await this.productsRepository.findAndCount({
      where: { isAvailable: true },
      relations: ['category'],
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });

    return { products, total };
  }

  async findByCategory(categoryId: number, page: number = 1, limit: number = 20): Promise<{ products: Product[], total: number }> {
    const [products, total] = await this.productsRepository.findAndCount({
      where: { categoryId, isAvailable: true },
      relations: ['category'],
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });

    return { products, total };
  }

  async findOne(id: number): Promise<Product | null> {
    return this.productsRepository.findOne({
      where: { id },
      relations: ['category'],
    });
  }

  async create(productData: Partial<Product>): Promise<Product> {
    const product = this.productsRepository.create(productData);
    return this.productsRepository.save(product);
  }

  async createFromScrapedData(scrapedData: {
    title: string;
    author?: string;
    price?: number;
    currency?: string;
    imageUrl?: string;
    description?: string;
    rating?: number;
    reviewCount?: number;
    url: string;
    categoryId: number;
  }): Promise<Product> {
    try {
      // Check if product already exists
      const existing = await this.productsRepository.findOne({
        where: { title: scrapedData.title, categoryId: scrapedData.categoryId }
      });

      if (existing) {
        // Update existing product
        Object.assign(existing, {
          ...scrapedData,
          lastScrapedAt: new Date(),
        });
        return this.productsRepository.save(existing);
      }

      // Create new product
      const product = this.productsRepository.create({
        ...scrapedData,
        worldOfBooksUrl: scrapedData.url,
        reviewCount: scrapedData.reviewCount || 0,
        isAvailable: true,
        lastScrapedAt: new Date(),
      });

      return this.productsRepository.save(product);
    } catch (error) {
      // If we get a duplicate error, try to find and return the existing one
      if (error.message && error.message.includes('duplicate key')) {
        const existing = await this.productsRepository.findOne({
          where: { title: scrapedData.title, categoryId: scrapedData.categoryId }
        });
        
        if (existing) {
          return existing;
        }
      }
      
      throw error;
    }
  }
}
