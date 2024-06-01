import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsModule } from './accounts/accounts.module';
import { PlansModule } from './plans/plans.module';
import { UsersModule } from './users/users.module';
import { FirebaseAdmin } from './config/firebase.setup';
import { AdvertisementsModule } from './advertisements/advertisements.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL'),
      }),
      inject: [ConfigService],
    }),
    AccountsModule,
    PlansModule,
    UsersModule,
    AdvertisementsModule,
  ],
  controllers: [],
  providers: [FirebaseAdmin],
})
export class AppModule {}
