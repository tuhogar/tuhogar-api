import { Injectable } from '@nestjs/common';
import { Advertisement } from 'src/domain/entities/advertisement.interface';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user.interface';
import { UserRole } from 'src/domain/entities/user.interface';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';

@Injectable()
export class GetByAccountIdAndIdAdvertisementUseCase {
    constructor(
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    async execute(authenticatedUser: AuthenticatedUser,advertisementId: string): Promise<Advertisement> {
        const filter = {
            _id: advertisementId,
            ...(authenticatedUser.userRole !== UserRole.MASTER && { accountId: authenticatedUser.accountId })
        };

        const advertisement = await this.advertisementRepository.getByAccountIdAndId(filter);
        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');

        return advertisement;
    }
}