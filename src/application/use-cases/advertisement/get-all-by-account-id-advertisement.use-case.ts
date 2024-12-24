import { Injectable } from '@nestjs/common';
import { Advertisement, AdvertisementTransactionType, AdvertisementType } from 'src/domain/entities/advertisement';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';

interface GetAllByAccountIdAdvertisementUseCaseCommand {
    accountId: string,
    page: number,
    limit: number,
    id?: string,
    transactionType?: AdvertisementTransactionType,
    type?: AdvertisementType,
    externalId?: string
}
@Injectable()
export class GetAllByAccountIdAdvertisementUseCase {
    constructor(
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    async execute({ accountId, page, limit, id, transactionType, type, externalId } : GetAllByAccountIdAdvertisementUseCaseCommand): Promise<{ data: Advertisement[]; count: number }> {
        return this.advertisementRepository.findByAccountIdWithEvents(accountId, page, limit, id, transactionType, type, externalId);
    }
}