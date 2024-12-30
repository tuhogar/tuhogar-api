import { Injectable } from '@nestjs/common';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';

@Injectable()
export class DeleteFavoriteUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(userId: string, advertisementId: string): Promise<void> {
        const user = await this.userRepository.deleteFavoriteAdvertisement(userId, advertisementId);
        if (!user) throw new Error('notfound.user.do.not.exists');
    }
}