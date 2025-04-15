import { Injectable } from '@nestjs/common';
import { Advertisement } from 'src/domain/entities/advertisement';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { RedisService } from '../../../infraestructure/persistence/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GetActiveAdvertisementUseCase {
    constructor(
        private readonly advertisementRepository: IAdvertisementRepository,
        private readonly redisService: RedisService
    ) {}

    async execute(advertisementId: string): Promise<Advertisement> {
        const uuid = uuidv4();
        console.log(`----------------INICIO INDIVIDUAL-${uuid}`);
        console.time(`INDIVIDUAL-${uuid}`);
        console.log(`INDIVIDUAL-BUSCANDO advertisement no redis-${uuid}: ${advertisementId}`);
        console.time(`INDIVIDUAL-redis-${uuid}`);
        let advertisement = await this.redisService.get(advertisementId) as Advertisement;
        console.timeEnd(`INDIVIDUAL-redis-${uuid}`);
        if (!advertisement) {
            console.log(`INDIVIDUAL-NAO ENCONTROU advertisement NO REDIS-${uuid}: ${advertisementId}`);
            console.log(`INDIVIDUAL-BUSCANDO advertisement na base de dados-${uuid}`);
            console.time(`INDIVIDUAL-database-${uuid}`);
            advertisement = await this.advertisementRepository.findOneActive(advertisementId);
            console.timeEnd(`INDIVIDUAL-database-${uuid}`);
            console.log(`INDIVIDUAL-ENCONTROU OU NAO ENCONTROU na base de dados-${uuid}: ${advertisementId}`);
            console.log(advertisement);
            console.log(`INDIVIDUAL-ENCONTROU OU NAO ENCONTROU na base de dados-${uuid}: ${advertisementId}`);
        }

        console.timeEnd(`INDIVIDUAL-${uuid}`);
        console.log(`----------------FIM INDIVIDUAL-${uuid}`);

        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');

        return advertisement;
    }
}