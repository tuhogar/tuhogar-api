import { Injectable } from '@nestjs/common';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';

@Injectable()
export class GetRegistrationsAdvertisementUseCase {
    constructor(
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    async execute(period: 'week' | 'month'): Promise<any[]> {
        return this.advertisementRepository.getAdvertisementRegistrations(period);
    }
}