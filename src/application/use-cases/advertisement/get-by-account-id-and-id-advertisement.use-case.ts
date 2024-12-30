import { Injectable } from '@nestjs/common';
import { Advertisement } from 'src/domain/entities/advertisement';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { UserRole } from 'src/domain/entities/user';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';

@Injectable()
export class GetByAccountIdAndIdAdvertisementUseCase {
    constructor(
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    async execute(authenticatedUser: AuthenticatedUser,advertisementId: string): Promise<Advertisement> {
        const advertisement = await this.advertisementRepository.findOneById(advertisementId);
        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');

        if (authenticatedUser.userRole !== UserRole.MASTER && authenticatedUser.accountId !== advertisement.accountId) {
            throw new Error('notfound.advertisement.do.not.exists');
        }

        return advertisement;
    }
}