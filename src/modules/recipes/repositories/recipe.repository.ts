import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Recipe } from '../entities/recipe.entity';

@Injectable()
export class RecipeRepository extends Repository<Recipe> {
  constructor(private dataSource: DataSource) {
    super(Recipe, dataSource.createEntityManager());
  }

  /**
   * Busca todas as receitas de um usuário específico.
   */
  async findAllByUser(userId: number): Promise<Recipe[]> {
    return this.createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.user', 'user')
      .leftJoinAndSelect('recipe.category', 'category')
      // aqui o nome da coluna no banco é `user_id`
      .where('recipe.user_id = :userId', { userId })
      .orderBy('recipe.id', 'ASC')
      .getMany();
  }

  /**
   * Busca uma receita pelo ID (inclui user e category).
   */
  async findById(id: number): Promise<Recipe | null> {
    return this.createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.user', 'user')
      .leftJoinAndSelect('recipe.category', 'category')
      .where('recipe.id = :id', { id })
      .getOne();
  }

  /**
   * Cria uma nova receita. O objeto passado já deve
   * conter os relacionamentos (user, category) mapeados como { id }.
   */
  async createAndSave(data: Partial<Recipe>): Promise<Recipe> {
    const entity = this.create(data);
    return this.save(entity);
  }

  /**
   * Atualiza uma receita existente. `data` já deve
   * ter convertido category para objeto { id } se necessário.
   */
  async updateAndGet(id: number, data: Partial<Recipe>): Promise<Recipe> {
    await this.createQueryBuilder()
      .update(Recipe)
      .set(data)
      .where('id = :id', { id })
      .execute();

    return this.findById(id) as Promise<Recipe>;
  }

  /**
   * Remove a receita pelo ID.
   */
  async deleteById(id: number): Promise<void> {
    await this.createQueryBuilder()
      .delete()
      .from(Recipe)
      .where('id = :id', { id })
      .execute();
  }
}
