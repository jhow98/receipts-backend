import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from '../entities/recipe.entity';
import { RecipeDto } from '../dto/recipe.dto';

@Injectable()
export class RecipeRepository {
  private readonly logger = new Logger(RecipeRepository.name);
  constructor(
    @InjectRepository(Recipe)
    private readonly ormRepository: Repository<Recipe>,
  ) {}

  async findAll(): Promise<Recipe[]> {
    this.logger.log('RecipeRepository.findAll: Buscando todas as receitas com relações.');
    return this.ormRepository.find({
      relations: ['user', 'category'],
    });
  }

  async findById(id: number): Promise<Recipe | null> {
    this.logger.log(`RecipeRepository.findById: Buscando receita com ID ${id} com relações.`);
    return this.ormRepository.findOne({
      where: { id },
      relations: ['user', 'category'],
    });
  }

  async create(data: RecipeDto): Promise<Recipe> {
    this.logger.log(`RecipeRepository.create: Criando nova receita com dados: ${JSON.stringify(data)}`);
    const recipe = this.ormRepository.create({
      ...data,
      user: { id: data.userId },
      category: { id: data.categoryId },
    });
    const savedRecipe = await this.ormRepository.save(recipe);
    this.logger.log(`RecipeRepository.create: Receita salva com ID: ${savedRecipe.id}`);
    return savedRecipe;
  }

  async update(id: number, data: RecipeDto): Promise<Recipe | null> {
    this.logger.log(`RecipeRepository.update: Atualizando receita com ID ${id} com dados: ${JSON.stringify(data)}`);
    await this.ormRepository.update(id, {
      ...data,
      user: { id: data.userId },
      category: { id: data.categoryId },
    });
    const updatedRecipe = await this.findById(id);
    this.logger.log(`RecipeRepository.update: Receita com ID ${id} atualizada. Resultado da busca pós-atualização: ${JSON.stringify(updatedRecipe)}`);
    return updatedRecipe;
  }

  async delete(id: number): Promise<void> {
    this.logger.log(`RecipeRepository.delete: Deletando receita com ID ${id}.`);
    const deleteResult = await this.ormRepository.delete(id);
    this.logger.log(`RecipeRepository.delete: Resultado da deleção: ${JSON.stringify(deleteResult)}`);
  }
}