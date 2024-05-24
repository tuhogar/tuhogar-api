import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsModule } from './accounts/accounts.module';
import { PlansModule } from './plans/plans.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/tuhogar?retryWrites=true&w=majority'),
    AccountsModule,
    PlansModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
