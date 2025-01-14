import * as dotenv from 'dotenv';
// dotenv.config();
dotenv.config({ path: process.cwd() + '/core/env/.env.dev' });

import { NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { createDocument } from './swagger/swagger';

const LISTEN_PORT = 3000;

async function bootstrap() {
  const opts: NestApplicationOptions = {};
  const app = await NestFactory.create<NestExpressApplication>(AppModule, opts);

  // Security middleware
  app.disable('x-powered-by');
  app.enableCors();
  app.use(helmet());
  app.use(helmet.noSniff());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.contentSecurityPolicy());

  // Swagger setup
  SwaggerModule.setup('api-docs', app, createDocument(app));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove extra fields not in the DTO
      forbidNonWhitelisted: true, // Throw error for extra fields
      transform: true, // Automatically transform payloads to DTO instances
    }),
  );

  await app.listen(process.env.PORT || LISTEN_PORT);
}
bootstrap();
