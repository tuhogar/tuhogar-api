import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsModule } from './accounts/accounts.module';
import { PlansModule } from './plans/plans.module';
import { UsersModule } from './users/users.module';
import { FirebaseAdmin } from './config/firebase.setup';
import { AdvertisementsModule } from './advertisements/advertisements.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/tuhogar?retryWrites=true&w=majority'),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
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
