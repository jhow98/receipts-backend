import { Test, TestingModule } from '@nestjs/testing';
import { RecipeService } from '../src/modules/recipes/services/recipe.service';
import { RecipeRepository } from '../src/modules/recipes/repositories/recipe.repository';
import { Recipe } from '../src/modules/recipes/entities/recipe.entity';
import { RecipeDto } from '../src/modules/recipes/dto/recipe.dto';

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipeService,
        { provide: RecipeRepository, useValue: repo },
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
    const dto = { name: 'Updated Recipe' } as RecipeDto;
    const existing = { id: 1 } as Recipe;
    const updated: Partial<Recipe> = {
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
    repo.findById.mockResolvedValue(existing);
    repo.update.mockResolvedValue(updated);

    const result = await service.update(1, dto);
    expect(result).toEqual(updated);
  });

  it('should delete a recipe', async () => {
    repo.findById.mockResolvedValue({ id: 1 });
    repo.delete.mockResolvedValue(undefined);

    await expect(service.delete(1)).resolves.toBeUndefined();
  });
});