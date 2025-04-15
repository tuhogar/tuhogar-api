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
        console.time('GetActivesAdvertisementUseCase-total');
        console.time('algolia');
        const { data: advertisementIds, count } = await this.algoliaService.get(getActivesAdvertisementDto);
        console.timeEnd('algolia');
        console.log('----ENCONTROU advertisementIds no algolia: ', advertisementIds.length);
        if (!advertisementIds.length) throw Error('notfound.advertisements');

        console.time(`redis-all: ${advertisementIds.length}`);
        let advertisements = await this.redisService.getAll(advertisementIds) as Advertisement[];
        console.timeEnd(`redis-all: ${advertisementIds.length}`);
        if (!advertisements?.length) {
            console.log('----NAO ENCONTROU advertisements NO REDIS');
            console.time(`database-all: ${advertisementIds.length}`);
            advertisements = await this.advertisementRepository.findByIdsAndAccountId(advertisementIds, undefined);
            console.timeEnd(`database-all: ${advertisementIds.length}`);
            console.log('----ENCONTROU advertisements na base de dados: ', advertisements.length);
        }

        const advertisementMap = advertisements.reduce((acc, ad) => {
            acc[ad.id] = ad;
            return acc;
        }, {} as { [key: string]: Advertisement });
        
        const orderedAdvertisements = advertisementIds.map(id => advertisementMap[id]).filter(ad => ad !== undefined && ad !== null);

        console.timeEnd('GetActivesAdvertisementUseCase-total');
        return { data: orderedAdvertisements, count };
    }
}