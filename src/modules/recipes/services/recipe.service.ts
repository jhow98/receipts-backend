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
import { MetricsService } from '../../../common/metrics/metrics.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class RecipeService {
  constructor(
    private readonly recipeRepository: RecipeRepository,
    private readonly logger: AppLogger,
    private readonly metrics: MetricsService,
  ) {
    this.logger.log(RecipeService.name);
  }

  /** Listagem geral */
  async findAll(): Promise<Recipe[]> {
    this.logger.log('Retrieving all recipes');
    const list = await this.recipeRepository.findAll();
    this.logger.log(`Found ${list.length} recipes`);
    return list;
  }

  /** Listagem por usuário, com filtro opcional de nome */
  async findAllByUser(userId: number, name?: string): Promise<Recipe[]> {
    this.logger.log(`Retrieving recipes for user ${userId}` + (name ? ` filtered by name="${name}"` : ''));
    const list = name
      ? await this.recipeRepository.findAllByUserAndName(userId, name)
      : await this.recipeRepository.findAllByUser(userId);
    this.logger.log(`Found ${list.length} recipes for user ${userId}`);
    return list;
  }

  async findById(id: number): Promise<Recipe> {
    this.logger.log(`Looking up recipe ID ${id}`);
    const recipe = await this.recipeRepository.findById(id);
    if (!recipe) {
      this.logger.warn(`Recipe ID ${id} not found`);
      throw new NotFoundException(`Receita com ID ${id} não encontrada`);
    }
    this.logger.log(`Recipe ID ${id} retrieved`);
    return recipe;
  }

  async create(data: RecipeDto & { userId: number }): Promise<Recipe> {
    this.logger.log(`Creating recipe for user ${data.userId}: ${data.name}`);
    const { userId, ...dto } = data;
    const { categoryId, ...rest } = dto;
    const toSave: any = { ...rest, user: { id: userId } };
    if (categoryId !== undefined) toSave.category = { id: categoryId };

    try {
      const created = await this.recipeRepository.createAndSave(toSave);
      this.metrics.incrementarReceitasCriadas();
      this.logger.log(`Recipe created with ID ${created.id}`);
      return created;
    } catch (err) {
      this.metrics.incrementarFalhasReceita();
      this.logger.error('Error creating recipe', err.stack);
      throw new HttpException('Erro ao criar receita', HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: number, dto: RecipeDto): Promise<Recipe> {
    this.logger.log(`Updating recipe ID ${id}`);
    const exists = await this.recipeRepository.findById(id);
    if (!exists) {
      this.logger.warn(`Cannot update, recipe ID ${id} not found`);
      throw new NotFoundException(`Receita com ID ${id} não encontrada`);
    }

    const {
      name,
      preparation_time_minutes,
      servings,
      ingredients,
      preparation_method,
      categoryId,
    } = dto;
    const toUpdate: any = {
      name,
      servings,
      ingredients,
      preparationTimeMinutes: preparation_time_minutes,
      preparationMethod: preparation_method,
    };
    if (categoryId !== undefined) toUpdate.category = { id: categoryId };

    try {
      const updated = await this.recipeRepository.updateAndGet(id, toUpdate);
      this.logger.log(`Recipe ID ${id} updated`);
      return updated;
    } catch (err) {
      this.logger.error(`Error updating recipe ID ${id}`, err.stack);
      throw new HttpException('Erro ao atualizar receita', HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Deleting recipe ID ${id}`);
    const exists = await this.recipeRepository.findById(id);
    if (!exists) {
      this.logger.warn(`Cannot delete, recipe ID ${id} not found`);
      throw new NotFoundException(`Receita com ID ${id} não encontrada`);
    }
    await this.recipeRepository.delete(id);
    this.logger.log(`Recipe ID ${id} deleted`);
  }

  async print(id: number): Promise<Buffer> {
    this.logger.log(`Generating PDF for recipe ID ${id}`);
    const r = await this.findById(id);
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
    const buf: Buffer[] = [];
    doc.on('data', c => buf.push(c));
    doc.on('end', () => {});
    doc.text(r.name);
    doc.end();
    this.logger.log(`PDF generated for recipe ID ${id}`);
    return Buffer.concat(buf);
  }
}
