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
        console.log(`----------------INICIO GetActivesAdvertisementUseCase-${uuid}`);
        console.time(`GetActivesAdvertisementUseCase-${uuid}`);
        console.time(`algolia-${uuid}`);
        const { data: advertisementIds, count } = await this.algoliaService.get(getActivesAdvertisementDto);
        console.timeEnd(`algolia-${uuid}`);
        console.log(`ENCONTROU advertisementIds no algolia-${uuid}: ${advertisementIds.length}`);
        if (!advertisementIds.length) throw Error('notfound.advertisements');

        console.time(`redis-all-${uuid}: ${advertisementIds.length}`);
        let advertisements = await this.redisService.getAll(advertisementIds) as Advertisement[];
        console.timeEnd(`redis-all-${uuid}: ${advertisementIds.length}`);
        if (!advertisements?.length) {
            console.log(`NAO ENCONTROU advertisements NO REDIS-${uuid}`);
            console.time(`database-all-${uuid}: ${advertisementIds.length}`);
            advertisements = await this.advertisementRepository.findByIdsAndAccountId(advertisementIds, undefined);
            console.timeEnd(`database-all-${uuid}: ${advertisementIds.length}`);
            console.log(`ENCONTROU advertisements na base de dados-${uuid}: ${advertisementIds.length}`);
        }

        const advertisementMap = advertisements.reduce((acc, ad) => {
            acc[ad.id] = ad;
            return acc;
        }, {} as { [key: string]: Advertisement });
        
        const orderedAdvertisements = advertisementIds.map(id => advertisementMap[id]).filter(ad => ad !== undefined && ad !== null);

        console.timeEnd(`GetActivesAdvertisementUseCase-${uuid}`);
        console.log(`----------------FIM GetActivesAdvertisementUseCase-${uuid}`);
        return { data: orderedAdvertisements, count };
    }
}