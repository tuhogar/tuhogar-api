import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { AccountSchema } from './interfaces/account.schema';
import { PlansModule } from 'src/plans/plans.module';
import { UsersModule } from 'src/users/users.module';
import { FirebaseAdmin } from 'src/config/firebase.setup';
import { AdvertisementsModule } from 'src/advertisements/advertisements.module';
import { ImageUploadModule } from 'src/image-upload/image-upload.module';
import { PayUModule } from 'src/payments/payu/payu.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Account', schema: AccountSchema }]),
    PlansModule,
    UsersModule,
    AdvertisementsModule,
    ImageUploadModule,
    PayUModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService, FirebaseAdmin]
})
export class AccountsModule {}
