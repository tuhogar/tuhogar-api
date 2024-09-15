import { Injectable } from '@nestjs/common';
import { IAmenityRepository } from 'src/application/interfaces/repositories/amenity.repository.interface';
import { Amenity } from 'src/domain/entities/amenity.interface';

@Injectable()
export class GetAllAmenityUseCase {
    constructor(
        private readonly amenityRepository: IAmenityRepository,
    ) {}

    async execute(): Promise<Amenity[]> {
        return this.amenityRepository.find();
    }
}