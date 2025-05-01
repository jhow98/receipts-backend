import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { RecipeService } from '../services/recipe.service';
import { RecipeDto } from '../dto/recipe.dto';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import PDFDocument from 'pdfkit';
import { Stream } from 'stream';
import { AppLogger } from '../../../common/logger/logger.service';

@ApiTags('Recipes')
@Controller('recipes')
export class RecipeController {
  constructor(
    private readonly recipeService: RecipeService,
    private readonly logger: AppLogger,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new recipe' })
  @ApiResponse({ status: 201, description: 'Recipe created successfully.' })
  @ApiBody({ type: RecipeDto })
  async create(@Body() recipeDto: RecipeDto) {
    console.log('recipeDto recebido:', recipeDto);
    this.logger.log(`Recebida requisição para criar receita: ${JSON.stringify(recipeDto)}`);
    const result = await this.recipeService.create(recipeDto);
    this.logger.log(`Receita criada com sucesso: ${JSON.stringify(result)}`);
    return result;
  }

  @Get()
  @ApiOperation({ summary: 'List all recipes' })
  @ApiResponse({ status: 200, description: 'List of recipes returned.' })
  @ApiResponse({ status: 204, description: 'No recipes found.' })
  async findAll(@Res() res: Response) {
    this.logger.log('Recebida requisição para listar todas as receitas');
    const recipes = await this.recipeService.findAll();
    if (!recipes.length) {
      this.logger.log('Nenhuma receita encontrada');
      return res.status(HttpStatus.NO_CONTENT).send();
    }
    this.logger.log(`Retornando ${recipes.length} receitas`);
    return res.status(HttpStatus.OK).json(recipes);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a recipe by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Recipe found.' })
  @ApiResponse({ status: 404, description: 'Recipe not found.' })
  async findOne(@Param('id') id: number, @Res() res: Response) {
    this.logger.log(`Recebida requisição para buscar receita com ID ${id}`);
    const recipe = await this.recipeService.findById(id);
    if (!recipe) {
      this.logger.warn(`Receita com ID ${id} não encontrada`);
      throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
    }
    this.logger.log(`Receita encontrada: ${JSON.stringify(recipe)}`);
    return res.status(HttpStatus.OK).json(recipe);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a recipe by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: RecipeDto })
  @ApiResponse({ status: 200, description: 'Recipe updated successfully.' })
  @ApiResponse({ status: 404, description: 'Recipe not found.' })
  async update(
    @Param('id') id: number,
    @Body() recipeDto: RecipeDto,
    @Res() res: Response,
  ) {
    this.logger.log(`Recebida requisição para atualizar receita com ID ${id}: ${JSON.stringify(recipeDto)}`);
    const updated = await this.recipeService.update(id, recipeDto);
    if (!updated) {
      this.logger.warn(`Receita com ID ${id} não encontrada para atualização`);
      throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
    }
    this.logger.log(`Receita atualizada com sucesso: ${JSON.stringify(updated)}`);
    return res.status(HttpStatus.OK).json(updated);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a recipe by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Recipe deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Recipe not found.' })
  async delete(@Param('id') id: number, @Res() res: Response) {
    this.logger.log(`Recebida requisição para deletar receita com ID ${id}`);
    await this.recipeService.delete(id);
    this.logger.log(`Receita com ID ${id} deletada com sucesso`);
    return res.send();
  }

  @Get(':id/print')
  @ApiOperation({ summary: 'Imprime uma receita em PDF' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'PDF gerado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Receita não encontrada.' })
  async print(@Param('id') id: number, @Res() res: Response) {
    this.logger.log(`Recebida requisição para imprimir receita com ID ${id}`);
    const pdfBuffer = await this.recipeService.print(id);
  
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=receita-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
  
    return res.send(pdfBuffer);
  }
}
