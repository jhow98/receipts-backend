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
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import { RecipeService } from '../services/recipe.service';
import { RecipeDto } from '../dto/recipe.dto';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AppLogger } from '../../../common/logger/logger.service';

@ApiTags('Recipes')
@UseGuards(AuthGuard('jwt'))
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
  async create(
    @Req() req: Request & { user: { id: number } },
    @Body() recipeDto: RecipeDto,
  ) {
    const userId = req.user.id;
    this.logger.log(
      `Recebida requisição para criar receita do usuário ${userId}: ${JSON.stringify(
        recipeDto,
      )}`,
    );
    const result = await this.recipeService.create({
      ...recipeDto,
      userId,
    });
    return result;
  }

  @Get()
  @ApiOperation({ summary: 'List all recipes of the logged‑in user' })
  @ApiResponse({ status: 200, description: 'List of recipes returned.' })
  @ApiResponse({ status: 204, description: 'No recipes found.' })
  async findAll(
    @Req() req: Request & { user: { id: number } },
    @Res() res: Response,
  ) {
    const userId = req.user.id;
    this.logger.log(
      `Recebida requisição para listar receitas do usuário ${userId}`,
    );

    const recipes = await this.recipeService.findAllByUser(userId);
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
    const recipe = await this.recipeService.findById(id);
    return res.status(HttpStatus.OK).json(recipe);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a recipe' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: RecipeDto })
  @ApiResponse({ status: 200, description: 'Recipe updated.' })
  @ApiResponse({ status: 404, description: 'Recipe not found.' })
  async update(
    @Param('id') id: number,
    @Body() recipeDto: RecipeDto,
  ): Promise<any> {
    return this.recipeService.update(id, recipeDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a recipe' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Recipe deleted.' })
  @ApiResponse({ status: 404, description: 'Recipe not found.' })
  async remove(@Param('id') id: number) {
    await this.recipeService.remove(id);
  }

  @Get(':id/print')
  @ApiOperation({ summary: 'Print a recipe as PDF' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'PDF returned.' })
  @ApiResponse({ status: 404, description: 'Recipe not found.' })
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