import { Injectable } from '@nestjs/common';
import { Advertisement } from 'src/domain/entities/advertisement';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';

@Injectable()
export class GetAllByAccountIdAdvertisementUseCase {
    constructor(
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    async execute(accountId: string): Promise<Advertisement[]> {
        return this.advertisementRepository.getAllByAccountId(accountId);
    }
}