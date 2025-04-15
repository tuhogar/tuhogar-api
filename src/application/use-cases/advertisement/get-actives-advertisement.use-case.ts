import { Injectable } from '@nestjs/common';
import { Advertisement } from 'src/domain/entities/advertisement';
import { AlgoliaService } from 'src/infraestructure/algolia/algolia.service';
import { GetActivesAdvertisementDto } from 'src/infraestructure/http/dtos/advertisement/get-actives-advertisement.dto';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { RedisService } from '../../../infraestructure/persistence/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GetActivesAdvertisementUseCase {
    constructor(
        private readonly algoliaService: AlgoliaService,
        private readonly advertisementRepository: IAdvertisementRepository,
        private readonly redisService: RedisService
    ) {}

    async execute(getActivesAdvertisementDto: GetActivesAdvertisementDto): Promise<{ data: Advertisement[]; count: number }> {
        const uuid = uuidv4();
        console.log(`----------------INICIO ALL-${uuid}`);
        console.time(`ALL-${uuid}`);
        console.time(`ALL-algolia-${uuid}`);
        const { data: advertisementIds, count } = await this.algoliaService.get(getActivesAdvertisementDto);
        console.timeEnd(`ALL-algolia-${uuid}`);
        console.log(`ALL-ENCONTROU advertisementIds no algolia-${uuid}: ${advertisementIds.length}`);
        if (!advertisementIds.length) throw Error('notfound.advertisements');

        console.time(`ALL-redis-${uuid}: ${advertisementIds.length}`);
        let advertisements = await this.redisService.getAll(advertisementIds) as Advertisement[];
        console.timeEnd(`ALL-redis-${uuid}: ${advertisementIds.length}`);
        if (!advertisements?.length) {
            console.log(`ALL-NAO ENCONTROU advertisements NO REDIS-${uuid}`);
            console.time(`ALL-database-${uuid}: ${advertisementIds.length}`);
            advertisements = await this.advertisementRepository.findByIdsAndAccountId(advertisementIds, undefined);
            console.timeEnd(`ALL-database-${uuid}: ${advertisementIds.length}`);
            console.log(`ALL-ENCONTROU advertisements na base de dados-${uuid}: ${advertisementIds.length}`);
        }

        const advertisementMap = advertisements.reduce((acc, ad) => {
            acc[ad.id] = ad;
            return acc;
        }, {} as { [key: string]: Advertisement });
        
        const orderedAdvertisements = advertisementIds.map(id => advertisementMap[id]).filter(ad => ad !== undefined && ad !== null);

        console.timeEnd(`ALL-${uuid}`);
        console.log(`----------------FIM ALL-${uuid}`);
        return { data: orderedAdvertisements, count };
    }
}