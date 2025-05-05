import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Recipe } from '../entities/recipe.entity';
import { AppLogger } from '../../../common/logger/logger.service';

@Injectable()
export class RecipeRepository {
  constructor(
    @InjectRepository(Recipe)
    private readonly repo: Repository<Recipe>,
    private readonly logger: AppLogger,
  ) {
    this.logger.log(RecipeRepository.name);
  }

  async findAll(): Promise<Recipe[]> {
    this.logger.log('Fetching all recipes (admin view)');
    const list = await this.repo.find({ relations: ['category', 'user'] });
    this.logger.log(`Found ${list.length} recipes total`);
    return list;
  }

  /** todas as receitas de um determinado usuário */
  async findAllByUser(userId: number): Promise<Recipe[]> {
    this.logger.log(`Fetching recipes for user ${userId}`);
    const list = await this.repo.find({
      where: { user: { id: userId } },
      relations: ['category', 'user'],
    });
    this.logger.log(`Found ${list.length} recipes for user ${userId}`);
    return list;
  }

  /** mesmas receitas de um user, mas filtrando pelo nome */
  async findAllByUserAndName(userId: number, name: string): Promise<Recipe[]> {
    this.logger.log(`Fetching recipes for user ${userId} filtered by name like "%${name}%"`);
    const list = await this.repo.find({
      where: {
        user: { id: userId },
        name: Like(`%${name}%`),
      },
      relations: ['category', 'user'],
    });
    this.logger.log(`Found ${list.length} recipes for user ${userId} with name filter`);
    return list;
  }

  async findById(id: number): Promise<Recipe | null> {
    this.logger.log(`Looking up recipe by ID ${id}`);
    const recipe = await this.repo.findOne({
      where: { id },
      relations: ['category', 'user'],
    });
    this.logger.log(recipe ? `Recipe ${id} found` : `Recipe ${id} not found`);
    return recipe;
  }

  async createAndSave(data: Partial<Recipe>): Promise<Recipe> {
    this.logger.log(`Creating new recipe entity: ${JSON.stringify(data)}`);
    const entity = this.repo.create(data);
    const saved = await this.repo.save(entity);
    this.logger.log(`Recipe created with ID ${saved.id}`);
    return saved;
  }

  async updateAndGet(id: number, dto: Partial<Recipe>): Promise<Recipe> {
    this.logger.log(`Updating recipe ID ${id} with data: ${JSON.stringify(dto)}`);
    const entity = await this.repo.preload({ id, ...dto });
    if (!entity) {
      this.logger.warn(`Cannot update: recipe ID ${id} not found`);
      throw new Error(`Receita com ID ${id} não encontrada`);
    }
    const updated = await this.repo.save(entity);
    this.logger.log(`Recipe ID ${id} updated`);
    return updated;
  }

  async delete(id: number): Promise<void> {
    this.logger.log(`Deleting recipe ID ${id}`);
    await this.repo.delete(id);
    this.logger.log(`Recipe ID ${id} deleted`);
  }
}
