interface ErrorWithMessage {
  message: string;
  stack?: string;
}

import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from './category.entity';
import { Product } from '../products/product.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @Inject(CACHE_MANAGER) private cacheManager: any,
  ) {}

  // ✅ Fixed cache wrapper methods
  private async cacheGet<T>(key: string): Promise<T | undefined> {
    try {
      const result = await this.cacheManager.get(key); // ✅ No type argument
      return result as T; // ✅ Cast to desired type
    } catch (_error) {
      this.logger.warn(`Cache get failed for key "${key}": ${_error.message}`);
      return undefined;
    }
  }

  private async cacheSet(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (_error) {
      this.logger.warn(`Cache set failed for key "${key}": ${_error.message}`);
    }
  }

  private async cacheDel(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (_error) {
      this.logger.warn(
        `Cache delete failed for key "${key}": ${_error.message}`,
      );
    }
  }

  private async cacheReset(): Promise<void> {
    try {
      if (this.cacheManager.store && this.cacheManager.store.reset) {
        await this.cacheManager.store.reset();
      } else {
        const commonKeys = [
          'categories:all',
          'categories:hierarchy',
          'categories:main',
        ];

        for (const key of commonKeys) {
          await this.cacheDel(key);
        }
      }
      this.logger.debug('Cache invalidated');
    } catch (_error) {
      this.logger.error(`Cache reset failed: ${_error.message}`);
    }
  }

  async create(createCategoryDto: Partial<Category>): Promise<Category> {
    try {
      this.logger.log(`Creating new category: ${createCategoryDto.name}`);

      const category = this.categoryRepository.create(createCategoryDto);
      const savedCategory = await this.categoryRepository.save(category);

      await this.cacheReset();

      this.logger.log(
        `Successfully created category with ID: ${savedCategory.id}`,
      );
      return savedCategory;
    } catch (_error) {
      this.logger.error(
        `Failed to create category: ${_error.message}`,
        _error.stack,
      );
      throw _error;
    }
  }

  async findAll(): Promise<Category[]> {
    const cacheKey = 'categories:all';

    try {
      let categories = await this.cacheGet<Category[]>(cacheKey);

      if (categories) {
        this.logger.debug('Categories retrieved from cache');
        return categories;
      }

      this.logger.log('Fetching all categories from database');
      categories = await this.categoryRepository.find({
        relations: ['subcategories', 'parent'],
        order: {
          displayOrder: 'ASC',
          createdAt: 'DESC',
        },
      });

      await this.cacheSet(cacheKey, categories, 600);
      this.logger.debug(
        `Cached ${categories.length} categories for 10 minutes`,
      );

      return categories;
    } catch (_error) {
      this.logger.error(
        `Error fetching categories: ${_error.message}`,
        _error.stack,
      );
      throw _error;
    }
  }

  async findAllWithHierarchy(): Promise<Category[]> {
    const cacheKey = 'categories:hierarchy';

    try {
      let mainCategories = await this.cacheGet<Category[]>(cacheKey);

      if (mainCategories) {
        this.logger.debug('Category hierarchy retrieved from cache');
        return mainCategories;
      }

      this.logger.log('Fetching category hierarchy from database');
      mainCategories = await this.categoryRepository.find({
        where: { parentId: IsNull() },
        relations: ['subcategories', 'subcategories.subcategories'],
        order: {
          displayOrder: 'ASC',
          createdAt: 'DESC',
        },
      });

      await this.cacheSet(cacheKey, mainCategories, 900);
      this.logger.debug(
        `Cached hierarchy with ${mainCategories.length} main categories for 15 minutes`,
      );

      return mainCategories;
    } catch (_error) {
      this.logger.error(
        `Error fetching category hierarchy: ${_error.message}`,
        _error.stack,
      );
      throw _error;
    }
  }

  async findOne(id: number): Promise<Category> {
    const cacheKey = `category:${id}`;

    try {
      const category = await this.cacheGet<Category>(cacheKey);

      if (category) {
        this.logger.debug(`Category ${id} retrieved from cache`);
        return category;
      }

      this.logger.log(`Fetching category ${id} from database`);
      const foundCategory = await this.categoryRepository.findOne({
        where: { id },
        relations: ['products', 'subcategories', 'parent'],
      });

      if (!foundCategory) {
        this.logger.warn(`Category with ID ${id} not found`);
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      await this.cacheSet(cacheKey, foundCategory, 300);
      this.logger.debug(`Cached category ${id} for 5 minutes`);

      return foundCategory;
    } catch (_error) {
      if (_error instanceof NotFoundException) {
        throw _error;
      }
      this.logger.error(
        `Error fetching category ${id}: ${_error.message}`,
        _error.stack,
      );
      throw _error;
    }
  }

  async findByParentId(parentId: number | null): Promise<Category[]> {
    const cacheKey = `categories:parent:${parentId || 'null'}`;

    try {
      let categories = await this.cacheGet<Category[]>(cacheKey);

      if (categories) {
        this.logger.debug(
          `Categories with parent ${parentId} retrieved from cache`,
        );
        return categories;
      }

      categories = await this.categoryRepository.find({
        where: parentId === null ? { parentId: IsNull() } : { parentId },
        relations: ['subcategories'],
        order: { displayOrder: 'ASC', name: 'ASC' },
      });

      await this.cacheSet(cacheKey, categories, 600);
      this.logger.debug(
        `Cached ${categories.length} categories with parent ${parentId} for 10 minutes`,
      );

      return categories;
    } catch (_error) {
      this.logger.error(
        `Error fetching categories with parent ${parentId}: ${_error.message}`,
        _error.stack,
      );
      throw _error;
    }
  }

  async getCategoryProducts(
    categoryId: number,
    page: number = 1,
    limit: number = 12,
    search?: string,
    sortBy?: string,
  ) {
    const cacheKey = `category:${categoryId}:products:${page}:${limit}:${search || 'none'}:${sortBy || 'date'}`;

    try {
      let result = await this.cacheGet<any>(cacheKey);

      if (result) {
        this.logger.debug(
          `Category ${categoryId} products retrieved from cache`,
        );
        return result;
      }

      const startTime = Date.now();
      this.logger.log(
        `Fetching products for category ${categoryId}, page ${page}`,
      );

      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
        relations: ['subcategories'],
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }

      const skip = (page - 1) * limit;

      const categoryIds = [categoryId];
      if (category.subcategories) {
        categoryIds.push(...category.subcategories.map((sub) => sub.id));
      }

      let queryBuilder = this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .where('product.categoryId IN (:...categoryIds)', { categoryIds });

      if (search && search.trim()) {
        queryBuilder = queryBuilder.andWhere(
          '(product.title ILIKE :search OR product.author ILIKE :search OR product.description ILIKE :search)',
          { search: `%${search.trim()}%` },
        );
      }

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

      result = {
        products,
        category,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };

      await this.cacheSet(cacheKey, result, 180);

      const duration = Date.now() - startTime;
      this.logger.log(
        `Fetched ${products.length} products for category ${categoryId} in ${duration}ms`,
      );

      return result;
    } catch (_error) {
      if (_error instanceof NotFoundException) {
        throw _error;
      }
      this.logger.error(
        `Error fetching products for category ${categoryId}: ${_error.message}`,
        _error.stack,
      );
      throw _error;
    }
  }

  async update(
    id: number,
    updateCategoryDto: Partial<Category>,
  ): Promise<Category> {
    try {
      this.logger.log(`Updating category ${id}`);

      const category = await this.findOne(id);
      Object.assign(category, updateCategoryDto);
      const updatedCategory = await this.categoryRepository.save(category);

      await this.cacheReset();

      this.logger.log(`Successfully updated category ${id}`);
      return updatedCategory;
    } catch (_error) {
      this.logger.error(
        `Failed to update category ${id}: ${_error.message}`,
        _error.stack,
      );
      throw _error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      this.logger.log(`Removing category ${id}`);

      const category = await this.findOne(id);

      if (category.subcategories && category.subcategories.length > 0) {
        await this.categoryRepository.update(
          { parentId: id },
          { parentId: category.parentId },
        );
        this.logger.log(
          `Moved ${category.subcategories.length} subcategories up the hierarchy`,
        );
      }

      await this.categoryRepository.remove(category);

      await this.cacheReset();

      this.logger.log(`Successfully removed category ${id}`);
    } catch (_error) {
      this.logger.error(
        `Failed to remove category ${id}: ${_error.message}`,
        _error.stack,
      );
      throw _error;
    }
  }

  async createSubcategory(
    parentId: number,
    subcategoryData: Partial<Category>,
  ): Promise<Category> {
    try {
      this.logger.log(`Creating subcategory for parent ${parentId}`);

      const parentCategory = await this.findOne(parentId);

      const subcategory = this.categoryRepository.create({
        ...subcategoryData,
        parentId: parentCategory.id,
      });

      const savedSubcategory = await this.categoryRepository.save(subcategory);

      await this.cacheReset();

      this.logger.log(
        `Successfully created subcategory ${savedSubcategory.id} for parent ${parentId}`,
      );
      return savedSubcategory;
    } catch (_error) {
      this.logger.error(
        `Failed to create subcategory for parent ${parentId}: ${_error.message}`,
        _error.stack,
      );
      throw _error;
    }
  }

  async getMainCategories(): Promise<Category[]> {
    const cacheKey = 'categories:main';

    try {
      let categories = await this.cacheGet<Category[]>(cacheKey);

      if (categories) {
        this.logger.debug('Main categories retrieved from cache');
        return categories;
      }

      categories = await this.categoryRepository.find({
        where: { parentId: IsNull() },
        relations: ['subcategories'],
        order: { displayOrder: 'ASC', name: 'ASC' },
      });

      await this.cacheSet(cacheKey, categories, 900);
      this.logger.debug(
        `Cached ${categories.length} main categories for 15 minutes`,
      );

      return categories;
    } catch (_error) {
      this.logger.error(
        `Error fetching main categories: ${_error.message}`,
        _error.stack,
      );
      throw _error;
    }
  }

  async getSubcategoriesByParent(parentId: number): Promise<Category[]> {
    return this.findByParentId(parentId);
  }

  async getHealthStatus(): Promise<{
    status: string;
    categoriesCount: number;
    cache: string;
    timestamp: string;
  }> {
    try {
      const categoriesCount = await this.categoryRepository.count();

      let cacheStatus = 'healthy';
      try {
        await this.cacheSet('health-check', 'test', 10);
        const testValue = await this.cacheGet('health-check');
        await this.cacheDel('health-check');

        if (testValue !== 'test') {
          cacheStatus = 'unhealthy';
        }
      } catch (cacheError) {
        this.logger.warn(`Cache health check failed: ${cacheError.message}`);
        cacheStatus = 'unhealthy';
      }

      return {
        status: 'healthy',
        categoriesCount,
        cache: cacheStatus,
        timestamp: new Date().toISOString(),
      };
    } catch (_error) {
      this.logger.error(`Health check failed: ${_error.message}`, _error.stack);
      return {
        status: 'unhealthy',
        categoriesCount: 0,
        cache: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async warmCache(): Promise<void> {
    try {
      this.logger.log('Warming up category cache...');
      await Promise.all([
        this.findAll(),
        this.findAllWithHierarchy(),
        this.getMainCategories(),
      ]);
      this.logger.log('Category cache warmed successfully');
    } catch (_error) {
      this.logger.error(
        `Cache warming failed: ${_error.message}`,
        _error.stack,
      );
    }
  }
}
