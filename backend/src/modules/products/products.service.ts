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

  async findAll(page: number = 1, limit: number = 10) {
    const [products, total] = await this.productsRepository.findAndCount({
      relations: ['category'],
      where: { isAvailable: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByCategory(
    categoryId: number,
    page: number = 1,
    limit: number = 10,
  ) {
    const [products, total] = await this.productsRepository.findAndCount({
      where: { categoryId, isAvailable: true },
      relations: ['category'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Fixed return type
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

  async update(
    id: number,
    productData: Partial<Product>,
  ): Promise<Product | null> {
    await this.productsRepository.update(id, productData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.productsRepository.delete(id);
  }

  async createBulk(productsData: Partial<Product>[]): Promise<Product[]> {
    const products = this.productsRepository.create(productsData);
    return this.productsRepository.save(products);
  }
}
