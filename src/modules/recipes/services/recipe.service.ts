import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Counter } from 'prom-client';
import { RecipeRepository } from '../repositories/recipe.repository';
import { RecipeDto } from '../dto/recipe.dto';
import { Recipe } from '../entities/recipe.entity';
import { AppLogger } from '../../../common/logger/logger.service';
import PDFDocument from 'pdfkit';
import { MetricsService } from '../../../common/metrics/metrics.service';

@Injectable()
export class RecipeService {
  constructor(
    private readonly recipeRepository: RecipeRepository,
    private readonly logger: AppLogger,
    private readonly metricsService: MetricsService,
  ) {}

  async findAll(): Promise<Recipe[]> {
    this.logger.log('Buscando todas as receitas');
    return await this.recipeRepository.findAll();
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

  async create(data: RecipeDto): Promise<Recipe> {
    this.logger.log(`Iniciando criação da receita: ${JSON.stringify(data)}`);
    try {
      const created = await this.recipeRepository.create({
        ...data,
        user: { id: data.userId },
        category: { id: data.categoryId },
      } as any);
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
    this.logger.log(
      `Iniciando atualização da receita ID ${id} com dados: ${JSON.stringify(data)}`,
    );

    const recipe = await this.recipeRepository.findById(id);
    if (!recipe) {
      this.logger.warn(`Receita com ID ${id} não encontrada para atualização`);
      throw new NotFoundException(`Receita com ID ${id} não encontrada`);
    }

    const { userId, categoryId, ...rest } = data;

    const updated = await this.recipeRepository.update(id, {
      ...rest,
      user: { id: userId },
      category: { id: categoryId },
    } as any);

    this.logger.log(`Receita ID ${id} atualizada com sucesso`);
    return updated;
  }

  async delete(id: number): Promise<void> {
    this.logger.log(`Iniciando exclusão da receita ID ${id}`);

    const exists = await this.recipeRepository.findById(id);
    if (!exists) {
      this.logger.warn(`Receita com ID ${id} não encontrada para exclusão`);
      throw new NotFoundException(`Receita com ID ${id} não encontrada`);
    }

    await this.recipeRepository.delete(id);
    this.logger.log(`Receita ID ${id} excluída com sucesso`);
  }

  async print(id: number): Promise<Buffer> {
    this.logger.log(`Iniciando impressão da receita ID ${id}`);
    const recipe = await this.recipeRepository.findById(id);
    if (!recipe) {
      this.logger.warn(`Receita com ID ${id} não encontrada para impressão`);
      throw new NotFoundException(`Receita com ID ${id} não encontrada`);
    }

    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => this.logger.log(`PDF da receita ID ${id} gerado com sucesso`));

    doc.fontSize(20).text(`Receita: ${recipe.name}`);
    doc.moveDown();
    doc.fontSize(12).text(`Tempo de preparo: ${recipe.preparation_time_minutes} minutos`);
    doc.text(`Porções: ${recipe.servings}`);
    doc.moveDown();
    doc.text(`Ingredientes: ${recipe.ingredients}`);
    doc.moveDown();
    doc.text(`Modo de preparo: ${recipe.preparation_method}`);
    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }
}
