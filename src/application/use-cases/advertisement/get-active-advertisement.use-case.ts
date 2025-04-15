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
        console.log(`----------------INICIO GetActiveAdvertisementUseCase-${uuid}`);
        console.time(`GetActiveAdvertisementUseCase-${uuid}`);
        console.log(`BUSCANDO advertisement no redis-${uuid}: ${advertisementId}`);
        console.time(`redis-individual-${uuid}`);
        let advertisement = await this.redisService.get(advertisementId) as Advertisement;
        console.timeEnd(`redis-individual-${uuid}`);
        if (!advertisement) {
            console.log(`----NAO ENCONTROU advertisement NO REDIS-${uuid}: ${advertisementId}`);
            console.log(`----BUSCANDO advertisement na base de dados-${uuid}`);
            console.time(`database-individual-${uuid}`);
            advertisement = await this.advertisementRepository.findOneActive(advertisementId);
            console.timeEnd(`database-individual-${uuid}`);
            console.log(`----ENCONTROU OU NAO ENCONTROU na base de dados-${uuid}: ${advertisementId}`);
            console.log(advertisement);
            console.log(`----ENCONTROU OU NAO ENCONTROU na base de dados-${uuid}: ${advertisementId}`);
        }

        console.timeEnd(`GetActiveAdvertisementUseCase-${uuid}`);
        console.log(`----------------FIM GetActiveAdvertisementUseCase-${uuid}`);

        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');

        return advertisement;
    }
}