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
      where: { isActive: true },
      relations: ['products'],
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

  // Fixed method to handle duplicates properly
  async createFromScrapedData(scrapedData: {
    name: string;
    slug: string;
    url: string;
  }): Promise<Category> {
    try {
      // Check if category already exists by name OR slug
      const existing = await this.categoriesRepository.findOne({
        where: [{ name: scrapedData.name }, { slug: scrapedData.slug }],
      });

      if (existing) {
        // Update existing category
        existing.worldOfBooksUrl = scrapedData.url;
        existing.isActive = true;
        return this.categoriesRepository.save(existing);
      }

      // Create new category
      const category = this.categoriesRepository.create({
        name: scrapedData.name,
        slug: scrapedData.slug,
        worldOfBooksUrl: scrapedData.url,
        isActive: true,
      });

      return this.categoriesRepository.save(category);
    } catch (error) {
      // If we still get a duplicate error, try to find and return the existing one
      if (error.message && error.message.includes('duplicate key')) {
        const existing = await this.categoriesRepository.findOne({
          where: [{ name: scrapedData.name }, { slug: scrapedData.slug }],
        });

        if (existing) {
          return existing;
        }
      }

      throw error;
    }
  }
}
