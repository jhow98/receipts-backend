import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/user.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { MetricsModule } from './common/metrics/metrics.module';
import { MetricsService } from './common/metrics/metrics.service';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecipeModule } from './modules/recipes/recipe.module';

@Module({
  imports: [DatabaseModule, UserModule,RecipeModule, MetricsModule, ConfigModule.forRoot({
    isGlobal: true,
  }),],
  controllers: [AppController],
  providers: [AppService, MetricsService],
  exports: [MetricsService],
})
export class AppModule {}
