import { Injectable } from '@nestjs/common';
import { AdvertisementStatus } from 'src/domain/entities/advertisement';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { CreateUpdateAdvertisementDto } from 'src/infraestructure/http/dtos/advertisement/create-update-advertisement.dto';
import { AlgoliaService } from 'src/infraestructure/algolia/algolia.service';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { RedisService } from '../../../infraestructure/persistence/redis/redis.service';

@Injectable()
export class UpdateAdvertisementUseCase {
    constructor(
        private readonly algoliaService: AlgoliaService,
        private readonly advertisementRepository: IAdvertisementRepository,
        private readonly redisService: RedisService
    ) {}

    async execute(
        authenticatedUser: AuthenticatedUser,
        advertisementId: string,
        createUpdateAdvertisementDto: CreateUpdateAdvertisementDto,
    ): Promise<{ id: string }> {

        let removeOnAlgolia = false;

        const advertisement = await this.advertisementRepository.findOneById(advertisementId);
        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');

        if (authenticatedUser.accountId !== advertisement.accountId) {
            throw new Error('notfound.advertisement.do.not.exists');
        }

        const update: any = { 
            updatedUserId: authenticatedUser.userId,
            ...createUpdateAdvertisementDto
        }

        if (createUpdateAdvertisementDto.description !== advertisement.description) {
            update.status = AdvertisementStatus.WAITING_FOR_APPROVAL;
            removeOnAlgolia = true;
        }

        const updatedAdvertisement = await this.advertisementRepository.update(advertisementId, authenticatedUser.accountId, update);

        if (removeOnAlgolia) {
            await this.algoliaService.delete(updatedAdvertisement.id);
            await this.redisService.delete(updatedAdvertisement.id);
        } else {
            const updatedAdvertisementForRedis = await this.advertisementRepository.findByIdsAndAccountId([updatedAdvertisement.id], undefined);
            await Promise.all(
                updatedAdvertisementForRedis.map((a) => this.redisService.set(a.id, a))
            );
        }

        return { id: updatedAdvertisement.id };
    }
}