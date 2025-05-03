import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from '../services/category.service';
import { Category } from '../entities/category.entity';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: Partial<Record<keyof CategoryService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        { provide: CategoryService, useValue: service },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const cats: Category[] = [
        Object.assign(new Category(), { id: 1, name: 'A' }),
        Object.assign(new Category(), { id: 2, name: 'B' }),
      ];
      service.findAll!.mockResolvedValue(cats);

      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(cats);
    });

  });
});
