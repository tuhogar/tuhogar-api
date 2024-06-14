import { Module } from '@nestjs/common';
import { AmenitiesService } from './amenities.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AmenitySchema } from './interfaces/amenities.schema';
import { AmenitiesController } from './amenities.controller';
import { AmenityIsExistingKeyConstraint } from './validators/amenitiy-is-existing-key.validator';
import { AmenityIsExistingNameConstraint } from './validators/amenitiy-is-existing-name.validator';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Amenity', schema: AmenitySchema }])],
  providers: [AmenitiesService, AmenityIsExistingKeyConstraint, AmenityIsExistingNameConstraint],
  controllers: [AmenitiesController]
})
export class AmenitiesModule {}
