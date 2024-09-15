import { Injectable } from '@nestjs/common';
import { Advertisement } from 'src/domain/entities/advertisement.interface';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';

@Injectable()
export class GetAdvertisementUseCase {
    constructor(
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    async execute(advertisementId: string): Promise<Advertisement> {
        const advertisement = await this.advertisementRepository.get(advertisementId);
        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');

        return advertisement;
    }
}