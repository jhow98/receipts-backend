import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from '../entities/recipe.entity';
import { RecipeDto } from '../dto/recipe.dto';

@Injectable()
export class RecipeRepository {
  constructor(
    @InjectRepository(Recipe)
    private readonly ormRepository: Repository<Recipe>,
  ) {}

  async findAll(): Promise<Recipe[]> {
    return this.ormRepository.find({
      relations: ['user', 'category'],
    });
  }

  async findById(id: number): Promise<Recipe | null> {
    return this.ormRepository.findOne({
      where: { id },
      relations: ['user', 'category'],
    });
  }

  async create(data: RecipeDto): Promise<Recipe> {
    const recipe = this.ormRepository.create(data);
    return await this.ormRepository.save(recipe);
  }

  async update(id: number, data: RecipeDto): Promise<Recipe> {
    await this.ormRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
