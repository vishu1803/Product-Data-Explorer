import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/ (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/');
    expect(response.status).toBe(200);
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  it('/api/categories (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/api/categories');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('/api/health (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/api/health');
    expect(response.status).toBe(200);
  });
});
