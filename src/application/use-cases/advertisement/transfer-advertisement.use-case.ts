import { Injectable } from '@nestjs/common';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { RedisService } from '../../../infraestructure/persistence/redis/redis.service';

interface TransferAdvertisementUseCaseCommand {
    userId: string
    accountIdFrom: string
    accountIdTo: string
}

@Injectable()
export class TransferAdvertisementUseCase {
    constructor(
        private readonly advertisementRepository: IAdvertisementRepository,
        private readonly redisService: RedisService
    ) {}

    async execute({ userId, accountIdFrom, accountIdTo }: TransferAdvertisementUseCaseCommand): Promise<void> {
        const advertisementIds = await this.advertisementRepository.transfer(userId, accountIdFrom, accountIdTo);
        
        const advertisementsForRedis = await this.advertisementRepository.findByIdsAndAccountId(advertisementIds, undefined);
        await Promise.all([
            advertisementsForRedis.map((a) => this.redisService.set(a.id, a)),
            this.redisService.deleteByPattern('advertisements-cache:*'),
        ]);
    }
}