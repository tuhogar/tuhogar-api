import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Amenity } from 'src/domain/entities/amenity.interface';
import { GetAllAmenityUseCase } from 'src/application/use-cases/amenity/get-all-amenity.use-case';

@ApiTags('v1/amenities')
@Controller('v1/amenities')
export class AmenityController {
    constructor(
        private readonly getAllAmenityUseCase: GetAllAmenityUseCase,
    ) {}

    @ApiBearerAuth()
    @Get()
    async getAll(): Promise<Amenity[]> {
        return this.getAllAmenityUseCase.execute();
    }
}