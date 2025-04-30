import { Injectable } from '@nestjs/common';
import { RecipeRepository } from '../repositories/recipe.repository';
import { Recipe } from '../entities/recipe.entity';

@Injectable()
export class RecipeService {
  constructor(private readonly recipeRepository: RecipeRepository) {}

  async findAll(): Promise<Recipe[]> {
    return await this.recipeRepository.findAll();
  }
}
