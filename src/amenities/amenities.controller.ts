import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AmenitiesService } from './amenities.service';
import { Auth } from 'src/decorators/auth.decorator';
import { Amenity } from './interfaces/amenities.interface';

@ApiTags('v1/amenities')
@Controller('v1/amenities')
export class AmenitiesController {
    constructor(
        private readonly amenitiesService: AmenitiesService,
    ) {}

    @ApiBearerAuth()
    @Get()
    async getAll(): Promise<Amenity[]> {
        return this.amenitiesService.getAll();
    }
}
