import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RecipeRepository } from '../repositories/recipe.repository';
import { RecipeDto } from '../dto/recipe.dto';
import { Recipe } from '../entities/recipe.entity';
import { AppLogger } from '../../../common/logger/logger.service';
import PDFDocument from 'pdfkit';
import { MetricsService } from '../../../common/metrics/metrics.service';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Injectable()
export class RecipeService {
  constructor(
    private readonly recipeRepository: RecipeRepository,
    private readonly logger: AppLogger,
    private readonly metricsService: MetricsService,
  ) {}

  async findAllByUser(userId: number): Promise<any[]> {
    this.logger.log(`Buscando todas as receitas do usuário ${userId}`);
    const recipes = await this.recipeRepository.findAllByUser(userId);

    return recipes.map((r) => ({
      id: r.id,
      name: r.name,
      preparation_time_minutes: r.preparation_time_minutes,
      servings: r.servings,
      preparation_method: r.preparation_method,
      ingredients: r.ingredients,
      categoryId: r.category?.id,
      userId: r.user.id,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
  }

  async findById(id: number): Promise<Recipe> {
    this.logger.log(`Buscando receita com ID ${id}`);
    const recipe = await this.recipeRepository.findById(id);
    if (!recipe) {
      this.logger.warn(`Receita com ID ${id} não encontrada`);
      throw new NotFoundException(`Receita com ID ${id} não encontrada`);
    }
    return recipe;
  }

  async create(data: RecipeDto & { userId: number }): Promise<Recipe> {
    this.logger.log(`Iniciando criação da receita: ${JSON.stringify(data)}`);
    try {
      const user = new User();
      user.id = data.userId;

      const category = new Category();
      category.id = data.categoryId;

      const toCreate: Partial<Recipe> = {
        name: data.name,
        preparation_time_minutes: data.preparation_time_minutes,
        servings: data.servings,
        preparation_method: data.preparation_method,
        ingredients: data.ingredients,
        user,
        category,
      };

      const created = await this.recipeRepository.createAndSave(toCreate);
      this.logger.log(`Receita criada com sucesso: ${JSON.stringify(created)}`);
      this.metricsService.incrementarReceitasCriadas();
      return created;
    } catch (err) {
      this.logger.error('Erro ao salvar receita no banco', err.stack);
      this.metricsService.incrementarFalhasReceita();
      throw new HttpException('Erro ao criar receita', HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: number, data: RecipeDto): Promise<Recipe> {
    this.logger.log(`Atualizando receita ${id}: ${JSON.stringify(data)}`);

    const toUpdate: Partial<Recipe> = {
      name: data.name,
      preparation_time_minutes: data.preparation_time_minutes,
      servings: data.servings,
      preparation_method: data.preparation_method,
      ingredients: data.ingredients,
    };

    if (data.categoryId !== undefined) {
      const category = new Category();
      category.id = data.categoryId;
      toUpdate.category = category;
    }

    try {
      const updated = await this.recipeRepository.updateAndGet(id, toUpdate);
      return updated;
    } catch (err) {
      this.logger.error(`Erro ao atualizar receita ${id}`, err.stack);
      throw new HttpException('Erro ao atualizar receita', HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Removendo receita ${id}`);
    const recipe = await this.recipeRepository.findById(id);
    if (!recipe) {
      this.logger.warn(`Receita com ID ${id} não encontrada para remoção`);
      throw new NotFoundException(`Receita com ID ${id} não encontrada`);
    }
    await this.recipeRepository.deleteById(id);
  }

  async print(id: number): Promise<Buffer> {
    const recipe = await this.findById(id);
    const chunks: Buffer[] = [];
    const doc = new PDFDocument();
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.text(`Receita: ${recipe.name}`);
    doc.moveDown();
    doc.text(`Porções: ${recipe.servings}`);
    doc.moveDown();
    doc.text(`Ingredientes: ${recipe.ingredients}`);
    doc.moveDown();
    doc.text(`Modo de preparo: ${recipe.preparation_method}`);
    doc.end();

    return new Promise((resolve) =>
      doc.on('end', () => resolve(Buffer.concat(chunks))),
    );
  }
}
