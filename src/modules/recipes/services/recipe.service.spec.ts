import { Test, TestingModule } from '@nestjs/testing';
import { RecipeService } from './recipe.service';
import { RecipeRepository } from '../repositories/recipe.repository';
import { NotFoundException } from '@nestjs/common';
import { AppLogger } from '../../../common/logger/logger.service';
import { MetricsService } from '../../../common/metrics/metrics.service';

describe('RecipeService', () => {
  let service: RecipeService;
  let repo: {
    findAllByUser: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    delete: jest.Mock;
  };

  const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const mockMetrics = {
    incrementarReceitasCriadas: jest.fn(),
    incrementarFalhasReceita: jest.fn(),
  };

  beforeEach(async () => {
    repo = {
      findAllByUser: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      delete: jest.fn(),   // adiciona o mock aqui
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipeService,
        { provide: RecipeRepository, useValue: repo },
        { provide: AppLogger, useValue: mockLogger },
        { provide: MetricsService, useValue: mockMetrics },
      ],
    }).compile();

    service = module.get<RecipeService>(RecipeService);
    jest.clearAllMocks();
  });

  it('should list and map recipes by user', async () => {
    const raw = [
      {
        id: 1,
        name: 'A',
        preparation_time_minutes: 5,
        servings: 2,
        preparation_method: 'x',
        ingredients: 'y',
        category: { id: 3 },
        user: { id: 7 },
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    repo.findAllByUser.mockResolvedValue(raw);

    const out = await service.findAllByUser(7);
    expect(repo.findAllByUser).toHaveBeenCalledWith(7);
    expect(out).toEqual([
      {
        id: 1,
        name: 'A',
        preparation_time_minutes: 5,
        servings: 2,
        preparation_method: 'x',
        ingredients: 'y',
        categoryId: 3,
        userId: 7,
        created_at: raw[0].created_at,
        updated_at: raw[0].updated_at,
      },
    ]);
  });

  it('should remove a recipe', async () => {
    repo.findById.mockResolvedValue({ id: 5 });
    repo.delete.mockResolvedValue(undefined);

    await expect(service.remove(5)).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith(5);
  });

  it('should throw if recipe not found on print', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.print(1)).rejects.toThrow(NotFoundException);
  });
});
