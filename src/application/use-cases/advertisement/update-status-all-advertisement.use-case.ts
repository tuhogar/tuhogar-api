import { Injectable } from '@nestjs/common';
import { AdvertisementStatus } from 'src/domain/entities/advertisement.interface';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user.interface';
import { UserRole } from 'src/domain/entities/user.interface';
import { AlgoliaService } from 'src/infraestructure/algolia/algolia.service';
import { UpdateStatusAllAdvertisementsDto } from 'src/infraestructure/http/dtos/advertisement/update-status-all-advertisement.dto';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';

@Injectable()
export class UpdateStatusAllAdvertisementUseCase {
    constructor(
        private readonly algoliaService: AlgoliaService,
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    async execute(
        authenticatedUser: AuthenticatedUser,
        updateStatusAllAdvertisementsDto: UpdateStatusAllAdvertisementsDto,
    ): Promise<void> {
        const advertisementIds = updateStatusAllAdvertisementsDto.advertisements.map((a) => a.id);

        const filter = {
            _id: { $in: advertisementIds },
            ...(authenticatedUser.userRole !== UserRole.MASTER && { accountId: authenticatedUser.accountId })
        };

        let publishedAt = undefined;
        let approvingUserId = undefined;
        if (updateStatusAllAdvertisementsDto.status === AdvertisementStatus.ACTIVE) {
            publishedAt = new Date();
            approvingUserId = authenticatedUser.userId;
        }

        const update = {
            updatedUserId: authenticatedUser.userId,
            status: updateStatusAllAdvertisementsDto.status,
            publishedAt,
            approvingUserId,
          };

        const updatedAdvertisement = await this.advertisementRepository.updateStatusAll(filter, update);

        if (updatedAdvertisement.upsertedCount === 0 && updatedAdvertisement.modifiedCount === 0 && updatedAdvertisement.matchedCount === 0) throw new Error('notfound.advertisement.do.not.exists');

        if (updateStatusAllAdvertisementsDto.status !== AdvertisementStatus.ACTIVE) {
            updateStatusAllAdvertisementsDto.advertisements.forEach(async (a) => await this.algoliaService.delete(a.id));
        }
    }
}