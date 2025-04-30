import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from './entities/recipe.entity';
import { RecipeService } from './services/recipe.service';
import { RecipeController } from './controllers/recipe.controller';
import { RecipeRepository } from './repositories/recipe.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe])],
  providers: [RecipeService, RecipeRepository],
  controllers: [RecipeController],
  exports: [RecipeService],
})
export class RecipeModule {}
