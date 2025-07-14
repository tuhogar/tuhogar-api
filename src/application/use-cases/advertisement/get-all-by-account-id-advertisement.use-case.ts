import { Injectable } from '@nestjs/common';
import { Advertisement, AdvertisementStatus, AdvertisementTransactionType, AdvertisementType } from 'src/domain/entities/advertisement';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';

interface GetAllByAccountIdAdvertisementUseCaseCommand {
    accountId: string,
    page: number,
    limit: number,
    code?: number,
    transactionType?: AdvertisementTransactionType,
    type?: AdvertisementType,
    externalId?: string,
    status?: AdvertisementStatus[]
}
@Injectable()
export class GetAllByAccountIdAdvertisementUseCase {
    constructor(
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    async execute({ accountId, page, limit, code, transactionType, type, externalId, status } : GetAllByAccountIdAdvertisementUseCaseCommand): Promise<{ data: Advertisement[]; count: number }> {
        return this.advertisementRepository.findByAccountIdWithEvents(accountId, page, limit, code, transactionType, type, externalId, status);
    }
}