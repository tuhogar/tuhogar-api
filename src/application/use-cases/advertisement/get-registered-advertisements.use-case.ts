import { Injectable } from '@nestjs/common';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';

@Injectable()
export class GetRegisteredAdvertisementsUseCase {
    constructor(
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    async execute(period: 'week' | 'month'): Promise<any[]> {
        return this.advertisementRepository.getRegisteredAdvertisements(period);
    }
}