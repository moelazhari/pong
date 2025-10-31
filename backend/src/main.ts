import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { config } from 'dotenv';

config();

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  
  app.enableCors({
    origin:  process.env.FRONTEND_HOST && 'http://localhost:3000',
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe({
      transform: true,
  }));

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  await app.listen(8000);
}

bootstrap();