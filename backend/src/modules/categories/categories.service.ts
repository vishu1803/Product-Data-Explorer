import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from './category.entity';
import { Product } from '../products/product.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createCategoryDto: Partial<Category>): Promise<Category> {
    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      relations: ['subcategories', 'parent'],
      order: {
        displayOrder: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  async findAllWithHierarchy(): Promise<Category[]> {
    // Get all main categories (no parent) with their subcategories
    const mainCategories = await this.categoryRepository.find({
      where: { parentId: IsNull() }, // ✅ Use IsNull() instead of null
      relations: ['subcategories', 'subcategories.subcategories'],
      order: {
        displayOrder: 'ASC',
        createdAt: 'DESC',
      },
    });

    return mainCategories;
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products', 'subcategories', 'parent'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async findByParentId(parentId: number | null): Promise<Category[]> {
    return this.categoryRepository.find({
      where: parentId === null ? { parentId: IsNull() } : { parentId }, // ✅ Handle null properly
      relations: ['subcategories'],
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async getCategoryProducts(
    categoryId: number,
    page: number = 1,
    limit: number = 12,
    search?: string,
    sortBy?: string,
  ) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: ['subcategories'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    const skip = (page - 1) * limit;

    // Get products from this category and all its subcategories
    const categoryIds = [categoryId];
    if (category.subcategories) {
      categoryIds.push(...category.subcategories.map((sub) => sub.id));
    }

    let queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.categoryId IN (:...categoryIds)', { categoryIds });

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

    return {
      products,
      category,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async update(
    id: number,
    updateCategoryDto: Partial<Category>,
  ): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);

    // First, update any subcategories to remove parent reference or move them up
    if (category.subcategories && category.subcategories.length > 0) {
      await this.categoryRepository.update(
        { parentId: id },
        { parentId: category.parentId },
      );
    }

    await this.categoryRepository.remove(category);
  }

  async createSubcategory(
    parentId: number,
    subcategoryData: Partial<Category>,
  ): Promise<Category> {
    const parentCategory = await this.findOne(parentId);

    const subcategory = this.categoryRepository.create({
      ...subcategoryData,
      parentId: parentCategory.id,
    });

    return this.categoryRepository.save(subcategory);
  }

  async getMainCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { parentId: IsNull() }, // ✅ Use IsNull() instead of null
      relations: ['subcategories'],
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async getSubcategoriesByParent(parentId: number): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { parentId },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }
}
