import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  NotFoundException,
  ParseIntPipe,
  HttpCode,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RecipeService } from '../services/recipe.service';
import { RecipeDto } from '../dto/recipe.dto';
import { AppLogger } from '../../../common/logger/logger.service';
import { MetricsService } from '../../../common/metrics/metrics.service';

@Controller('recipes')
@UseGuards(AuthGuard('jwt'))
export class RecipeController {
  constructor(
    private readonly recipeService: RecipeService,
    private readonly logger: AppLogger,
    private readonly metrics: MetricsService,
  ) {
    this.logger.log(RecipeController.name);
  }

  @Get()
  @HttpCode(200)
  async findAll(
    @Req() req: any,
    @Query('name') name?: string,
  ) {
    this.logger.log(`Listando receitas do user ${req.user.id} (filtro: ${name})`);
    const list = await this.recipeService.findAllByUser(req.user.id, name);
    if (list.length === 0) {
      this.logger.log(`Nenhuma receita encontrada para user ${req.user.id}`);
      throw new HttpException('', HttpStatus.NO_CONTENT);
    }
    this.logger.log(`Retornando ${list.length} receitas para user ${req.user.id}`);
    return list;
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    this.logger.log(`Buscando receita ${id} para user ${req.user.id}`);
    const recipe = await this.recipeService.findById(id);
    if (recipe.user.id !== req.user.id) {
      this.logger.warn(`Acesso negado à receita ${id} por user ${req.user.id}`);
      throw new NotFoundException(`Receita não encontrada`);
    }
    return recipe;
  }

  @Post()
  async create(@Req() req: any, @Body() dto: RecipeDto) {
    this.logger.log(`Criando receita para user ${req.user.id}: ${dto.name}`);
    try {
      const created = await this.recipeService.create({ ...dto, userId: req.user.id });
      this.metrics.incrementarReceitasCriadas();
      return created;
    } catch (err) {
      this.metrics.incrementarFalhasReceita();
      throw err;
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RecipeDto,
    @Req() req: any,
  ) {
    this.logger.log(`Atualizando receita ${id} para user ${req.user.id}`);
    const recipe = await this.recipeService.findById(id);
    if (recipe.user.id !== req.user.id) {
      this.logger.warn(`Usuário ${req.user.id} não autorizado a atualizar receita ${id}`);
      throw new NotFoundException(`Receita não encontrada`);
    }
    return this.recipeService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    this.logger.log(`Removendo receita ${id} para user ${req.user.id}`);
    const recipe = await this.recipeService.findById(id);
    if (recipe.user.id !== req.user.id) {
      this.logger.warn(`Usuário ${req.user.id} não autorizado a deletar receita ${id}`);
      throw new NotFoundException(`Receita não encontrada`);
    }
    await this.recipeService.remove(id);
    this.logger.log(`Receita ${id} removida`);
  }
}
