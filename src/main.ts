import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/logger/winston.config';

import { Logger, ValidationPipe } from '@nestjs/common';

ConfigModule.forRoot();

const configService = new ConfigService();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Receitas')
    .setDescription('Documentação da API de receitas')
    .setVersion('1.0')
    .addTag('clientes')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.enableCors({
    origin: '*',
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
  });

  app.enableShutdownHooks();

  try {
    await app.listen(process.env.PORT || 3000);
    Logger.log(`🚀 API rodando em http://localhost:3000`);
    Logger.log(`📊 Métricas disponíveis em http://localhost:3000/metrics`);
  } catch (error) {
    Logger.error('Erro ao iniciar a aplicação:', error);
  }
}
bootstrap();
