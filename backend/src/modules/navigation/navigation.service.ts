
interface ErrorWithMessage {
  message: string;
  stack?: string;
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserNavigation } from './navigation.entity';

export interface SaveNavigationDto {
  userId: string;
  path: string;
  searchParams?: string;
  title?: string;
  userAgent?: string;
}

@Injectable()
export class NavigationService {
  private readonly logger = new Logger(NavigationService.name);

  constructor(
    @InjectRepository(UserNavigation)
    private navigationRepository: Repository<UserNavigation>,
  ) {}

  async saveNavigation(data: SaveNavigationDto): Promise<UserNavigation> {
    try {
      // Check if this exact navigation already exists recently (within 1 minute)
      const recentEntry = await this.navigationRepository.findOne({
        where: {
          userId: data.userId,
          path: data.path,
          searchParams: data.searchParams || '',
        },
        order: { timestamp: 'DESC' },
      });

      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

      if (recentEntry && recentEntry.timestamp > oneMinuteAgo) {
        return recentEntry; // Don't save duplicate within 1 minute
      }

      // Create navigation object properly
      const navigationData: Partial<UserNavigation> = {
        userId: data.userId,
        path: data.path,
        searchParams: data.searchParams,
        title: data.title,
      };

      const navigation = this.navigationRepository.create(navigationData);
      const saved = await this.navigationRepository.save(navigation);

      this.logger.log(`Saved navigation: ${data.userId} -> ${data.path}`);
      return saved;
    } catch (_error) {
      this.logger.error(`Failed to save navigation: ${_error.message}`);
      throw _error;
    }
  }

  async getUserNavigation(
    userId: string,
    limit: number = 20,
  ): Promise<UserNavigation[]> {
    try {
      return this.navigationRepository.find({
        where: { userId },
        order: { timestamp: 'DESC' },
        take: limit,
      });
    } catch (_error) {
      this.logger.error(`Failed to get user navigation: ${_error.message}`);
      throw _error;
    }
  }

  async getNavigationStats(userId: string): Promise<any> {
    try {
      const totalVisits = await this.navigationRepository.count({
        where: { userId },
      });

      const uniquePaths = await this.navigationRepository
        .createQueryBuilder('nav')
        .select('DISTINCT nav.path')
        .where('nav.userId = :userId', { userId })
        .getCount();

      const recentActivity = await this.navigationRepository.find({
        where: { userId },
        order: { timestamp: 'DESC' },
        take: 5,
      });

      return {
        totalVisits,
        uniquePaths,
        recentActivity,
      };
    } catch (_error) {
      this.logger.error(`Failed to get navigation stats: ${_error.message}`);
      throw _error;
    }
  }
}
