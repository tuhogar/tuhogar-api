import { Injectable } from '@nestjs/common';
import { Advertisement } from 'src/domain/entities/advertisement';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { RedisService } from '../../../infraestructure/persistence/redis/redis.service';

@Injectable()
export class GetActiveAdvertisementUseCase {
    constructor(
        private readonly advertisementRepository: IAdvertisementRepository,
        private readonly redisService: RedisService
    ) {}

    async execute(advertisementId: string): Promise<Advertisement> {
        //console.time('redis-individual');
        let advertisement = await this.redisService.get(advertisementId) as Advertisement;
        if (!advertisement) {
            console.log('----NAO ENCONTROU advertisement NO REDIS');
            console.log('----BUSCANDO advertisement na base de dados');
            advertisement = await this.advertisementRepository.findOneActive(advertisementId);
            console.log('----CONSULTADO na base de dados');
            console.log(advertisement);
            console.log('----CONSULTADO na base de dados');
        }

        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');

        return advertisement;
    }
}