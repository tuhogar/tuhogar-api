import { Module } from '@nestjs/common';
import { AdvertisementReasonsController } from './advertisement-reasons.controller';
import { AdvertisementReasonsService } from './advertisement-reasons.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AdvertisementReasonSchema } from './interfaces/advertisement-reasons.schema';
import { FirebaseAdmin } from 'src/config/firebase.setup';
import { IsExistingAdvertisementReasonConstraint } from './validators/is-existing-advertisement-reason.validator';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'AdvertisementReason', schema: AdvertisementReasonSchema }])],
  controllers: [AdvertisementReasonsController],
  providers: [AdvertisementReasonsService, IsExistingAdvertisementReasonConstraint, FirebaseAdmin]
})
export class AdvertisementReasonsModule {}
