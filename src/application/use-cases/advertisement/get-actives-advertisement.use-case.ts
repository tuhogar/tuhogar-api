import { Injectable } from '@nestjs/common';
import { Advertisement } from 'src/domain/entities/advertisement';
import { AlgoliaService } from 'src/infraestructure/algolia/algolia.service';
import { GetActivesAdvertisementDto } from 'src/infraestructure/http/dtos/advertisement/get-actives-advertisement.dto';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { RedisService } from '../../../infraestructure/persistence/redis/redis.service';

@Injectable()
export class GetActivesAdvertisementUseCase {
    constructor(
        private readonly algoliaService: AlgoliaService,
        private readonly advertisementRepository: IAdvertisementRepository,
        private readonly redisService: RedisService
    ) {}

    async execute(getActivesAdvertisementDto: GetActivesAdvertisementDto): Promise<{ data: Advertisement[]; count: number }> {
        const { data: advertisementIds, count } = await this.algoliaService.get(getActivesAdvertisementDto);
        if (!advertisementIds.length) throw Error('notfound.advertisements');

        let advertisements = await this.redisService.getAll(advertisementIds) as Advertisement[];
        if (!advertisements?.length) {
            advertisements = await this.advertisementRepository.findByIdsAndAccountId(advertisementIds, undefined);
        }

        const advertisementMap = advertisements.reduce((acc, ad) => {
            acc[ad.id] = ad;
            return acc;
        }, {} as { [key: string]: Advertisement });
        
        const orderedAdvertisements = advertisementIds.map(id => advertisementMap[id]).filter(ad => ad !== undefined && ad !== null);

        return { data: orderedAdvertisements, count };
    }
}