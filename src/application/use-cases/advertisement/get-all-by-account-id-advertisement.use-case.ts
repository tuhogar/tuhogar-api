import { Injectable } from '@nestjs/common';
import { Advertisement, AdvertisementTransactionType, AdvertisementType } from 'src/domain/entities/advertisement';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';

interface GetAllByAccountIdAdvertisementUseCaseCommand {
    accountId: string,
    page: number,
    limit: number,
    transactionType?: AdvertisementTransactionType,
    type?: AdvertisementType,
    externalId?: string
}
@Injectable()
export class GetAllByAccountIdAdvertisementUseCase {
    constructor(
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    async execute({ accountId, page, limit, transactionType, type, externalId } : GetAllByAccountIdAdvertisementUseCaseCommand): Promise<Advertisement[]> {
        return this.advertisementRepository.findByAccountIdWithEvents(accountId, page, limit, transactionType, type, externalId);
    }
}