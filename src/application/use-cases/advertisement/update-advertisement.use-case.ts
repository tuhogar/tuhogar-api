import { Injectable } from '@nestjs/common';
import { AdvertisementStatus } from 'src/domain/entities/advertisement';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { CreateUpdateAdvertisementDto } from 'src/infraestructure/http/dtos/advertisement/create-update-advertisement.dto';
import { AlgoliaService } from 'src/infraestructure/algolia/algolia.service';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';

@Injectable()
export class UpdateAdvertisementUseCase {
    constructor(
        private readonly algoliaService: AlgoliaService,
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    async execute(
        authenticatedUser: AuthenticatedUser,
        advertisementId: string,
        createUpdateAdvertisementDto: CreateUpdateAdvertisementDto,
    ): Promise<{ id: string }> {

        let removeOnAlgolia = false;

        const advertisement = await this.advertisementRepository.findOne(advertisementId, authenticatedUser.accountId);
        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');

        const update: any = { 
            updatedUserId: authenticatedUser.userId,
            ...createUpdateAdvertisementDto
        }

        if (createUpdateAdvertisementDto.description !== advertisement.description) {
            update.status = AdvertisementStatus.WAITING_FOR_APPROVAL;
            removeOnAlgolia = true;
        }

        const updatedAdvertisement = await this.advertisementRepository.findOneAndUpdate(advertisementId, authenticatedUser.accountId, update);

        if (removeOnAlgolia) await this.algoliaService.delete(updatedAdvertisement.id);

        return { id: updatedAdvertisement.id };
    }
}