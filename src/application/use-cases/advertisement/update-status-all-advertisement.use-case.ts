import { Injectable } from '@nestjs/common';
import { AdvertisementStatus } from 'src/domain/entities/advertisement';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { UserRole } from 'src/domain/entities/user';
import { AlgoliaService } from 'src/infraestructure/algolia/algolia.service';
import { UpdateStatusAllAdvertisementsDto } from 'src/infraestructure/http/dtos/advertisement/update-status-all-advertisement.dto';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';

interface UpdateStatusAllAdvertisementUseCaseCommand {
    accountId: string,
    userId: string,
    userRole: UserRole,
    advertisementIds: string[],
    status: AdvertisementStatus,
}

@Injectable()
export class UpdateStatusAllAdvertisementUseCase {
    constructor(
        private readonly algoliaService: AlgoliaService,
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    async execute(
        {accountId, userId, userRole, advertisementIds, status}: UpdateStatusAllAdvertisementUseCaseCommand
    ): Promise<void> {
        let publishedAt = undefined;
        let approvingUserId = undefined;
        if (status === AdvertisementStatus.ACTIVE) {
            publishedAt = new Date();
            approvingUserId = userId;
        }

        const updatedAdvertisement = await this.advertisementRepository.updateStatus(
            advertisementIds,
            userRole !== UserRole.MASTER ? accountId : undefined,
            status,
            publishedAt,
            approvingUserId,
        );

        if (updatedAdvertisement.upsertedCount === 0 && updatedAdvertisement.modifiedCount === 0 && updatedAdvertisement.matchedCount === 0) throw new Error('notfound.advertisement.do.not.exists');

        if (status !== AdvertisementStatus.ACTIVE) {
            await Promise.all(advertisementIds.map((a) => this.algoliaService.delete(a)));
        }
    }
}