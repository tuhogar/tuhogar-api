import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AmenityService } from 'src/application/use-cases/amenity/amenity.service';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { Amenity } from 'src/domain/entities/amenity.interface';

@ApiTags('v1/amenities')
@Controller('v1/amenities')
export class AmenityController {
    constructor(
        private readonly amenityService: AmenityService,
    ) {}

    @ApiBearerAuth()
    @Get()
    async getAll(): Promise<Amenity[]> {
        return this.amenityService.getAll();
    }
}