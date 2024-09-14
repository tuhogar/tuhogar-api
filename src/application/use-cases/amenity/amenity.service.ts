import { Injectable } from '@nestjs/common';
import { IAmenityRepository } from 'src/application/interfaces/repositories/amenity.repository.interface';
import { Amenity } from 'src/domain/entities/amenity.interface';

@Injectable()
export class AmenityService {
    constructor(
        private readonly amenityRepository: IAmenityRepository,
    ) {}

    async getAll(): Promise<Amenity[]> {
        return this.amenityRepository.getAll();
    }
}