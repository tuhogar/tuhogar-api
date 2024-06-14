import { Module } from '@nestjs/common';
import { AdvertisementCodesService } from './advertisement-codes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AdvertisementCodeSchema } from './interfaces/advertisement-codes.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'AdvertisementCode', schema: AdvertisementCodeSchema }]),
  ],
  providers: [AdvertisementCodesService],
  exports: [AdvertisementCodesService],
})
export class AdvertisementCodesModule {}
