import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({
      relations: ['products'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Category | null> {
    return this.categoriesRepository.findOne({
      where: { id },
      relations: ['products'],
    });
  }

  async create(categoryData: Partial<Category>): Promise<Category> {
    const category = this.categoriesRepository.create(categoryData);
    return this.categoriesRepository.save(category);
  }

  async update(id: number, categoryData: Partial<Category>): Promise<Category | null> {
    await this.categoriesRepository.update(id, categoryData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.categoriesRepository.delete(id);
  }

  // Helper method to generate slug from name
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
