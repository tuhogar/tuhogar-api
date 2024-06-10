import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { AccountSchema } from './interfaces/account.schema';
import { PlansModule } from 'src/plans/plans.module';
import { UsersModule } from 'src/users/users.module';
import { FirebaseAdmin } from 'src/config/firebase.setup';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Account', schema: AccountSchema }]),
    PlansModule,
    UsersModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService, FirebaseAdmin]
})
export class AccountsModule {}