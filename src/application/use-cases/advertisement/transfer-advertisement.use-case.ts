import { Injectable } from '@nestjs/common';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';

interface TransferAdvertisementUseCaseCommand {
    userId: string
    accountIdFrom: string
    accountIdTo: string
}

@Injectable()
export class TransferAdvertisementUseCase {
    constructor(
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    async execute({ userId, accountIdFrom, accountIdTo }: TransferAdvertisementUseCaseCommand): Promise<void> {
        const advertisements = await this.advertisementRepository.findForBulk(userId, accountIdFrom, accountIdTo);
    }
}