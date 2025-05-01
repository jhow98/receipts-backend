import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class RecipeDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiProperty({ example: 1, description: 'ID da receita (opcional em criação)' })
  id?: number;

  @IsString()
  @MaxLength(45)
  @IsNotEmpty()
  @ApiProperty({ example: 'Bolo de cenoura', description: 'Nome da receita' })
  name: string;

  @IsInt()
  @Type(() => Number)
  @ApiProperty({ example: 45, description: 'Tempo de preparo em minutos' })
  preparation_time_minutes: number;

  @IsInt()
  @Type(() => Number)
  @ApiProperty({ example: 8, description: 'Quantidade de porções' })
  servings: number;

  @IsString()
  @ApiProperty({ example: 'Misture tudo e asse por 40 minutos.', description: 'Modo de preparo' })
  preparation_method: string;

  @IsString()
  @ApiProperty({ example: 'cenoura, farinha, ovos', description: 'Ingredientes da receita' })
  ingredients: string;

  @IsInt()
  @Type(() => Number)
  @ApiProperty({ example: 1, description: 'ID do usuário que cadastrou a receita' })
  userId: number;

  @IsInt()
  @Type(() => Number)
  @ApiProperty({ example: 2, description: 'ID da categoria da receita' })
  categoryId: number;
}
