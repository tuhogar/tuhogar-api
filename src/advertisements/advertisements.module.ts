import { Module } from '@nestjs/common';
import { AdvertisementsController } from './advertisements.controller';
import { AdvertisementsService } from './advertisements.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AdvertisementSchema } from './interfaces/advertisement.schema';
import { FirebaseAdmin } from 'src/config/firebase.setup';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Advertisement', schema: AdvertisementSchema }]),
  ],
  controllers: [AdvertisementsController],
  providers: [AdvertisementsService, FirebaseAdmin]
})
export class AdvertisementsModule {}
