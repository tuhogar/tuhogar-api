import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from '@nestjs/schedule';
import { PersistenceModule } from './infraestructure/persistence/persistence.module';
import { HttpModule } from './infraestructure/http/http.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
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
