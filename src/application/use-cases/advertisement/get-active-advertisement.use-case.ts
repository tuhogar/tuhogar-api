import { Injectable } from '@nestjs/common';
import { Advertisement } from 'src/domain/entities/advertisement';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';

@Injectable()
export class GetActiveAdvertisementUseCase {
    constructor(
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    async execute(advertisementId: string): Promise<Advertisement> {
        const advertisement = await this.advertisementRepository.getActive(advertisementId);
        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');

        return advertisement;
    }
}