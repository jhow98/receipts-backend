import { Test, TestingModule } from '@nestjs/testing';
import { RecipeService } from './recipe.service';
import { RecipeRepository } from '../repositories/recipe.repository';
import { Recipe } from '../entities/recipe.entity';
import { RecipeDto } from '../dto/recipe.dto';
import { AppLogger } from '../../../common/logger/logger.service';
import { NotFoundException } from '@nestjs/common';

describe('RecipeService', () => {
  let service: RecipeService;
  let repo: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipeService,
        { provide: RecipeRepository, useValue: repo },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<RecipeService>(RecipeService);
  });

  it('should return all recipes', async () => {
    const mockRecipe: Recipe = { id: 1 } as Recipe;
    repo.findAll.mockResolvedValue([mockRecipe]);

    const result = await service.findAll();
    expect(result).toEqual([mockRecipe]);
  });

  it('should return a recipe by id', async () => {
    const mockRecipe: Recipe = { id: 1 } as Recipe;
    repo.findById.mockResolvedValue(mockRecipe);

    const result = await service.findById(1);
    expect(result).toEqual(mockRecipe);
  });

  it('should throw when recipe not found by id', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.findById(1)).rejects.toThrow('Receita com ID 1 não encontrada');
  });

  it('should create a recipe', async () => {
    const dto: RecipeDto = {
      name: 'Test Recipe',
      preparation_time_minutes: 10,
      servings: 2,
      preparation_method: 'Test method',
      ingredients: 'Test ingredients',
      userId: 1,
      categoryId: 1,
    };
    const mockRecipe: Partial<Recipe> = {
      id: 1,
      ...dto,
      created_at: new Date(),
      updated_at: new Date(),
      user: {
        id: dto.userId,
        name: 'User',
        login: 'user@example.com',
        password: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        recipes: [],
      },
      category: {
        id: dto.categoryId,
        name: 'Category',
        recipes: [],
      },
    };

    repo.create.mockResolvedValue(mockRecipe);
    const result = await service.create(dto);

    expect(result).toEqual(mockRecipe);
  });

  it('should update a recipe', async () => {
    const dto = {
      name: 'Updated Recipe',
      preparation_time_minutes: 20,
      servings: 3,
      preparation_method: 'Updated',
      ingredients: 'Updated',
      userId: 1,
      categoryId: 1,
    } as RecipeDto;

    const existing = { id: 1 } as Recipe;
    const updated = {
      id: 1,
      ...dto,
      created_at: new Date(),
      updated_at: new Date(),
      user: { id: 1, name: 'User', login: 'u', password: '', createdAt: new Date(), updatedAt: new Date(), recipes: [] },
      category: { id: 1, name: 'Category', recipes: [] },
    };

    repo.findById.mockResolvedValue(existing);
    repo.update.mockResolvedValue(updated);

    const result = await service.update(1, dto);
    expect(result).toEqual(updated);
  });

  it('should generate a PDF buffer when printing a recipe', async () => {
    const recipe: Recipe = {
      id: 1,
      name: 'Feijão',
      preparation_time_minutes: 40,
      servings: 5,
      preparation_method: 'Cozinhe o feijão com temperos',
      ingredients: 'feijão, alho, cebola, sal',
      user: {
        id: 1,
        name: 'Fulano',
        login: 'fulano',
        password: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        recipes: [],
      },
      category: {
        id: 1,
        name: 'Almoço',
        recipes: [],
      },
      created_at: new Date(),
      updated_at: new Date(),
    };

    repo.findById.mockResolvedValue(recipe);

    const buffer = await service.print(recipe.id);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should delete a recipe', async () => {
    repo.findById.mockResolvedValue({ id: 1 });
    repo.delete.mockResolvedValue(undefined);

    await expect(service.delete(1)).resolves.toBeUndefined();
  });

  it('should throw if recipe to print is not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.print(1)).rejects.toThrow(NotFoundException);
  });
});
