import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategoriesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return categories', async () => {
    const mockCategories = [
      { id: 1, name: 'Fiction', slug: 'fiction' },
      { id: 2, name: 'Non-Fiction', slug: 'non-fiction' },
    ];

    mockCategoriesService.findAll.mockResolvedValue(mockCategories);

    const result = await controller.findAll();
    expect(result).toEqual(mockCategories);
    expect(service.findAll).toHaveBeenCalled();
  });
});
