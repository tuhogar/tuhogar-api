import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { CustomExceptionFilter } from './filters/custom-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  console.log('MONGODB_URL (ConfigService):', configService.get<string>('MONGODB_URL'));
  console.log('MONGODB_URL (process.env):', process.env.MONGODB_URL);

  if (!configService.get<string>('MONGODB_URL')) {
    throw new Error('Missing MONGODB_URL environment variable');
  }

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
    whitelist: true,
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

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  await app.listen(3000);
}
bootstrap();
