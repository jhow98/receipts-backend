import { Test, TestingModule } from '@nestjs/testing';
import { RecipeController } from './recipe.controller';
import { RecipeService } from '../services/recipe.service';
import { RecipeDto } from '../dto/recipe.dto';
import { AppLogger } from '../../../common/logger/logger.service';
import { Response } from 'express';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  print: jest.fn(),
};

const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
};

describe('RecipeController', () => {
  let controller: RecipeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipeController],
      providers: [
        { provide: RecipeService, useValue: mockService },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    controller = module.get<RecipeController>(RecipeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a recipe', async () => {
    const dto: RecipeDto = {
      name: 'Arroz',
      preparation_time_minutes: 30,
      servings: 4,
      preparation_method: 'Cozinhe com água e sal',
      ingredients: 'arroz, água, sal',
      userId: 1,
      categoryId: 2,
    };
    const result = { id: 1, ...dto };

    mockService.create.mockResolvedValue(result);

    const created = await controller.create(dto);
    expect(created).toEqual(result);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('should print a recipe and return a PDF buffer', async () => {
    const mockPdf = Buffer.from('PDF content');
    mockService.print.mockResolvedValue(mockPdf);
  
    const reqId = 1;
    const res: Partial<Response> = {
      set: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  
    await controller.print(reqId, res as Response);
  
    expect(mockService.print).toHaveBeenCalledWith(reqId);
    expect(res.set).toHaveBeenCalledWith(expect.objectContaining({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=receita-${reqId}.pdf`,
    }));
    expect(res.send).toHaveBeenCalledWith(mockPdf);
  });
});
