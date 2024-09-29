import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AlgoliaService } from 'src/infraestructure/algolia/algolia.service';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { UpdateBulkUpdateDateUseCase } from '../bulk-update-date/update-bulk-update-date.use-case';
import { GetBulkUpdateDateUseCase } from '../bulk-update-date/get-bulk-update-date.use-case';

interface BulkAdvertisementUseCaseCommand {
    accountId?: string
}

@Injectable()
export class BulkAdvertisementUseCase {
    constructor(
        private readonly algoliaService: AlgoliaService,
        private readonly updateBulkUpdateDateUseCase: UpdateBulkUpdateDateUseCase,
        private readonly getBulkUpdateDateUseCase: GetBulkUpdateDateUseCase,
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    @Cron('*/1 * * * *')
    async execute(bulkAdvertisementUseCaseCommand: BulkAdvertisementUseCaseCommand): Promise<void> {
        let lastUpdatedAt = undefined;
        if (!bulkAdvertisementUseCaseCommand?.accountId) lastUpdatedAt = (await this.getBulkUpdateDateUseCase.execute())?.updatedAt || new Date(0);

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
        }
    }
}