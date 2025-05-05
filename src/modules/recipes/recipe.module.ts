import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from './entities/recipe.entity';
import { RecipeService } from './services/recipe.service';
import { RecipeController } from './controllers/recipe.controller';
import { RecipeRepository } from './repositories/recipe.repository';
import { LoggerModule } from '../../common/logger/logger.module';
import { MetricsModule } from '../../common/metrics/metrics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recipe]),
    LoggerModule,
    MetricsModule,
  ],
  providers: [RecipeService, RecipeRepository],
  controllers: [RecipeController],
  exports: [RecipeService],
})
export class RecipeModule {}
