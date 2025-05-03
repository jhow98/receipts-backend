import { Test, TestingModule } from '@nestjs/testing';
import { RecipeController } from './recipe.controller';
import { RecipeService } from '../services/recipe.service';
import { RecipeDto } from '../dto/recipe.dto';
import { AppLogger } from '../../../common/logger/logger.service';
import { MetricsService } from '../../../common/metrics/metrics.service';
import { Response, Request } from 'express';

describe('RecipeController', () => {
  let controller: RecipeController;
  const mockService = {
    create: jest.fn(),
    findAllByUser: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    print: jest.fn(),
  };
  const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const mockMetrics = { incrementarReceitasCriadas: jest.fn(), incrementarFalhasReceita: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipeController],
      providers: [
        { provide: RecipeService, useValue: mockService },
        { provide: AppLogger, useValue: mockLogger },
        { provide: MetricsService, useValue: mockMetrics },
      ],
    }).compile();

    controller = module.get<RecipeController>(RecipeController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a recipe adding userId from req.user', async () => {
    const dto: RecipeDto = {
      name: 'Arroz',
      preparation_time_minutes: 30,
      servings: 4,
      preparation_method: 'Cozinhe com água e sal',
      ingredients: 'arroz, água, sal',
      categoryId: 2,
    } as RecipeDto;
    
    const created = { id: 1, ...dto, userId: 1 };
    mockService.create.mockResolvedValue(created);

    const req = { user: { id: 1 } } as Request & { user: { id: number } };
    const result = await controller.create(req, dto);

    expect(mockService.create).toHaveBeenCalledWith({ ...dto, userId: 1 });
    expect(result).toEqual(created);
  });

  it('should list only recipes of the logged‑in user', async () => {
    const mockRecipes = [{ id: 10, name: 'X', userId: 1 }];
    mockService.findAllByUser.mockResolvedValue(mockRecipes);

    const req = { user: { id: 1 } } as Request & { user: { id: number } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;

    await controller.findAll(req, res);

    expect(mockService.findAllByUser).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockRecipes);
  });

  it('should return 204 when no recipes found', async () => {
    mockService.findAllByUser.mockResolvedValue([]);
    const req = { user: { id: 2 } } as any;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    } as unknown as Response;

    await controller.findAll(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('should remove a recipe', async () => {
    mockService.remove.mockResolvedValue(undefined);
    await expect(controller.remove(5)).resolves.toBeUndefined();
    expect(mockService.remove).toHaveBeenCalledWith(5);
  });
});
