import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AlgoliaService } from 'src/infraestructure/algolia/algolia.service';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { UpdateBulkUpdateDateUseCase } from '../bulk-update-date/update-bulk-update-date.use-case';
import { IBulkUpdateDateRepository } from 'src/application/interfaces/repositories/bulk-update-date.repository.interface';
import { RedisService } from '../../../infraestructure/persistence/redis/redis.service';


interface BulkAdvertisementUseCaseCommand {
    accountId?: string
}

@Injectable()
export class BulkAdvertisementUseCase {
    constructor(
        private readonly algoliaService: AlgoliaService,
        private readonly updateBulkUpdateDateUseCase: UpdateBulkUpdateDateUseCase,
        private readonly advertisementRepository: IAdvertisementRepository,
        private readonly bulkUpdateDateRepository: IBulkUpdateDateRepository,
        private readonly redisService: RedisService
    ) {}

    @Cron('*/1 * * * *', {
        name: 'bulk-advertisement'
      })
    async execute(bulkAdvertisementUseCaseCommand: BulkAdvertisementUseCaseCommand): Promise<void> {
        let lastUpdatedAt = undefined;

        if (!bulkAdvertisementUseCaseCommand?.accountId) {
            lastUpdatedAt = (await this.bulkUpdateDateRepository.findOne())?.updatedAt || new Date(0);
        }

        const advertisements = await this.advertisementRepository.findForBulk(bulkAdvertisementUseCaseCommand?.accountId, lastUpdatedAt);

        advertisements.forEach(advertisement => {
            const { address } = advertisement;
            if (!address?.latitude || !address?.longitude) {
                delete advertisement._geoloc;
            }
        });

        if (advertisements.length > 0) {
            await this.algoliaService.bulk(advertisements);
            
            if (!bulkAdvertisementUseCaseCommand?.accountId) {
                const updatedAt = new Date(Math.max(...advertisements.map(a => new Date((a.updatedAt as unknown as string)).getTime())));
                await this.updateBulkUpdateDateUseCase.execute({ updatedAt });
            }

            const advertisementIds = advertisements.map((a) => a._id);

            const advertisementsForRedis = await this.advertisementRepository.findByIdsAndAccountId(advertisementIds, undefined);
            await Promise.all([
                advertisementsForRedis.map((a) => this.redisService.set(a.id, a)),
                this.redisService.deleteByPattern('advertisements-cache:*'),
            ]);
        }
    }
}