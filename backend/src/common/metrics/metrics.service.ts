import { Injectable } from '@nestjs/common';

interface Metrics {
  requests: { [endpoint: string]: number };
  errors: { [type: string]: number };
  scraping: {
    totalJobs: number;
    successfulJobs: number;
    failedJobs: number;
    averageJobTime: number;
  };
}

@Injectable()
export class MetricsService {
  private metrics: Metrics = {
    requests: {},
    errors: {},
    scraping: {
      totalJobs: 0,
      successfulJobs: 0,
      failedJobs: 0,
      averageJobTime: 0,
    },
  };

  incrementRequest(endpoint: string): void {
    this.metrics.requests[endpoint] =
      (this.metrics.requests[endpoint] || 0) + 1;
  }

  incrementError(type: string): void {
    this.metrics.errors[type] = (this.metrics.errors[type] || 0) + 1;
  }

  recordScrapingJob(success: boolean, duration: number): void {
    this.metrics.scraping.totalJobs++;
    if (success) {
      this.metrics.scraping.successfulJobs++;
    } else {
      this.metrics.scraping.failedJobs++;
    }

    // Update average job time
    this.metrics.scraping.averageJobTime =
      (this.metrics.scraping.averageJobTime + duration) /
      this.metrics.scraping.totalJobs;
  }

  getMetrics(): Metrics {
    return { ...this.metrics };
  }
}
