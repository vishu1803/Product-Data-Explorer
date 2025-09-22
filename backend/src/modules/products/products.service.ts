import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { ProductReview } from './product-review.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductReview)
    private reviewRepository: Repository<ProductReview>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 12,
    search?: string,
    sortBy?: string,
  ) {
    const skip = (page - 1) * limit;

    let queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.reviews', 'reviews');

    // Apply search filter
    if (search && search.trim()) {
      queryBuilder = queryBuilder.where(
        '(product.title ILIKE :search OR product.author ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search.trim()}%` },
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price':
        queryBuilder = queryBuilder.orderBy('product.price', 'DESC');
        break;
      case 'rating':
        queryBuilder = queryBuilder.orderBy('product.rating', 'DESC');
        break;
      case 'title':
        queryBuilder = queryBuilder.orderBy('product.title', 'ASC');
        break;
      case 'date':
      default:
        queryBuilder = queryBuilder.orderBy('product.createdAt', 'DESC');
        break;
    }

    const [products, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      products,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'reviews'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findByCategory(
    categoryId: number,
    page: number = 1,
    limit: number = 12,
    search?: string,
    sortBy?: string,
  ) {
    const skip = (page - 1) * limit;

    let queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.reviews', 'reviews')
      .where('product.categoryId = :categoryId', { categoryId });

    // Apply search filter
    if (search && search.trim()) {
      queryBuilder = queryBuilder.andWhere(
        '(product.title ILIKE :search OR product.author ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search.trim()}%` },
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price':
        queryBuilder = queryBuilder.orderBy('product.price', 'DESC');
        break;
      case 'rating':
        queryBuilder = queryBuilder.orderBy('product.rating', 'DESC');
        break;
      case 'title':
        queryBuilder = queryBuilder.orderBy('product.title', 'ASC');
        break;
      case 'date':
      default:
        queryBuilder = queryBuilder.orderBy('product.createdAt', 'DESC');
        break;
    }

    const [products, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Get category information
    const category = products[0]?.category;

    return {
      products,
      category,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async getProductReviews(productId: number): Promise<ProductReview[]> {
    return this.reviewRepository.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
  }
}
