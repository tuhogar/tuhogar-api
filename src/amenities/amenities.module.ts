import { Module } from '@nestjs/common';
import { AmenitiesService } from './amenities.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AmenitySchema } from './interfaces/amenities.schema';
import { AmenitiesController } from './amenities.controller';
import { AmenityIsExistingIdConstraint } from './validators/amenitiy-is-existing-id.validator';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Amenity', schema: AmenitySchema }])],
  providers: [AmenitiesService, AmenityIsExistingIdConstraint],
  controllers: [AmenitiesController]
})
export class AmenitiesModule {}
