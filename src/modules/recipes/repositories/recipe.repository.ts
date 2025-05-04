import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { Recipe } from '../entities/recipe.entity'

@Injectable()
export class RecipeRepository extends Repository<Recipe> {
  constructor(private dataSource: DataSource) {
    super(Recipe, dataSource.createEntityManager())
  }

  async findAllByUser(userId: number, name?: string): Promise<Recipe[]> {
    const qb = this.createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.user', 'user')
      .leftJoinAndSelect('recipe.category', 'category')
      .where('recipe.user_id = :userId', { userId })

    if (name) {
      qb.andWhere('LOWER(recipe.name) LIKE LOWER(:name)', {
        name: `%${name}%`,
      })
    }

    return qb.orderBy('recipe.id', 'ASC').getMany()
  }

  async findById(id: number): Promise<Recipe | null> {
    return this.createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.user', 'user')
      .leftJoinAndSelect('recipe.category', 'category')
      .where('recipe.id = :id', { id })
      .getOne()
  }

  async createAndSave(data: Partial<Recipe>): Promise<Recipe> {
    const entity = this.create(data)
    return this.save(entity)
  }

  async updateAndGet(id: number, data: Partial<Recipe>): Promise<Recipe> {
    await this.createQueryBuilder()
      .update(Recipe)
      .set(data)
      .where('id = :id', { id })
      .execute()

    return this.findById(id) as Promise<Recipe>
  }

  async deleteById(id: number): Promise<void> {
    await this.createQueryBuilder()
      .delete()
      .from(Recipe)
      .where('id = :id', { id })
      .execute()
  }
}
