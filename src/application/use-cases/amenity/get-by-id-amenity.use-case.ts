import { Injectable } from '@nestjs/common';
import { IAmenityRepository } from 'src/application/interfaces/repositories/amenity.repository.interface';
import { Amenity } from 'src/domain/entities/amenity';

interface GetByIdAmenityUseCaseCommand {
    id: string,
}

@Injectable()
export class GetByIdAmenityUseCase {
    constructor(
        private readonly amenityRepository: IAmenityRepository,
    ) {}

    async execute({ id }: GetByIdAmenityUseCaseCommand): Promise<Amenity> {
        return this.amenityRepository.findById(id);
    }
}