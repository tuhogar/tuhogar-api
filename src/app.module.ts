import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from '@nestjs/schedule';
import { PersistenceModule } from './infraestructure/persistence/persistence.module';
import { HttpModule } from './infraestructure/http/http.module';
import { mercadoPagoConfig } from './infraestructure/config/mercado-pago.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      load: [mercadoPagoConfig],
    }),
    PersistenceModule.register({
      type: 'mongoose',
      global: true,
    }),
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
