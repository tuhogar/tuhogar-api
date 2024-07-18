import { Module } from '@nestjs/common';
import { AdvertisementsController } from './advertisements.controller';
import { AdvertisementsService } from './advertisements.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AdvertisementSchema } from './interfaces/advertisement.schema';
import { FirebaseAdmin } from 'src/config/firebase.setup';
import { AdvertisementCodesModule } from 'src/advertisement-codes/advertisement-codes.module';
import { AmenitiesModule } from 'src/amenities/amenities.module';
import { AlgoliaModule } from 'src/algolia/algolia.module';
import { BulkUpdateDateModule } from 'src/bulk-update-date/bulk-update-date.module';
import { OpenAiModule } from 'src/open-ai/open-ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Advertisement', schema: AdvertisementSchema }]),
    AdvertisementCodesModule,
    AmenitiesModule,
    AlgoliaModule,
    BulkUpdateDateModule,
    OpenAiModule,
  ],
  controllers: [AdvertisementsController],
  providers: [AdvertisementsService, FirebaseAdmin],
  exports: [AdvertisementsService],
})
export class AdvertisementsModule {}
