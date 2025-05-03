import { Controller, Get } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { Category } from '../entities/category.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  
  @Get()
  @ApiOperation({ summary: 'Listar todas as categorias' })  
  @ApiResponse({ status: 200, description: 'Lista de categorias retornada com sucesso.', type: [Category] })
  async findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }
}
