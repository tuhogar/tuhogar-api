import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { CustomExceptionFilter } from './infraestructure/http/filters/custom-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { RedisService } from './infraestructure/persistence/redis/redis.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Tuhogar API')
    .setDescription('Tuhogar API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/doc', app, document);

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

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors();

  app.use(bodyParser.json({ limit: '15mb' }));
  app.use(bodyParser.urlencoded({ limit: '15mb', extended: true }));

  const redisService = app.get(RedisService);
  await redisService.onModuleInit();

  await app.listen(3000);
}
bootstrap();
