import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(cookieParser());
  // Serve uploaded files from /uploads
  app.use('/uploads', express.static(join(__dirname, '..', 'public', 'uploads')));
  app.enableCors({ origin: true, credentials: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('MindCare API')
    .setDescription('Auth, Profissionais e Agendamentos')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 API rodando em http://localhost:${port}/api`);
}
bootstrap();
