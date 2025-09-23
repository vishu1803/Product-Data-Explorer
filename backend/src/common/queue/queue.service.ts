import { Injectable } from '@nestjs/common';
import { AppLoggerService } from '../logging/logger.service';

interface Job {
  id: string;
  type: 'scrape-categories' | 'scrape-products';
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  attempts: number;
  maxAttempts: number;
}

@Injectable()
export class QueueService {
  private jobs: Map<string, Job> = new Map();
  private processing = false;

  constructor(private logger: AppLoggerService) {
    this.startWorker();
  }

  async addJob(type: Job['type'], payload: any): Promise<string> {
    const jobId = crypto.randomUUID();
    const job: Job = {
      id: jobId,
      type,
      payload,
      status: 'pending',
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: 3,
    };

    this.jobs.set(jobId, job);
    this.logger.log(`Added job ${jobId} of type ${type}`, 'QueueService');

    return jobId;
  }

  async getJobStatus(jobId: string): Promise<Job | undefined> {
    return this.jobs.get(jobId);
  }

  private async startWorker(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (true) {
      const pendingJob = Array.from(this.jobs.values()).find(
        (job) => job.status === 'pending',
      );

      if (pendingJob) {
        await this.processJob(pendingJob);
      }

      // Wait before checking for more jobs
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  private async processJob(job: Job): Promise<void> {
    job.status = 'processing';
    job.attempts++;

    try {
      this.logger.log(`Processing job ${job.id}`, 'QueueService');

      // Simulate job processing
      await this.executeJob(job);

      job.status = 'completed';
      this.logger.log(`Completed job ${job.id}`, 'QueueService');
    } catch (error) {
      this.logger.error(
        `Job ${job.id} failed: ${error.message}`,
        error.stack,
        'QueueService',
      );

      if (job.attempts >= job.maxAttempts) {
        job.status = 'failed';
      } else {
        job.status = 'pending'; // Retry
      }
    }
  }

  private async executeJob(job: Job): Promise<void> {
    // Implement actual job processing here
    switch (job.type) {
      case 'scrape-categories':
        // Call scraping service
        break;
      case 'scrape-products':
        // Call scraping service
        break;
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }
}
