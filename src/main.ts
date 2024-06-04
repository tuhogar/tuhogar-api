import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CustomExceptionFilter } from './filters/custom-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));
  app.useGlobalFilters(new CustomExceptionFilter());

  /*const corsOptions: CorsOptions = {
    origin: 'http://localhost:3000', // Substitua pelo domínio que fará as requisições à sua API
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept',
    credentials: true,
  };*/

  app.enableCors();
  await app.listen(3000);
}
bootstrap();
