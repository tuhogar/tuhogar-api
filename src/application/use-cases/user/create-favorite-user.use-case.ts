import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';
import { User } from 'src/domain/entities/user';

interface CreateFavoriteUserUseCaseCommand {
    userId: string;
    advertisementId: string;
}

@Injectable()
export class CreateFavoriteUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
    ) {}

    async execute({
        userId,
        advertisementId
    }: CreateFavoriteUserUseCaseCommand): Promise<User> {
        const response = await this.userRepository.addFavoriteAdvertisement(userId, advertisementId);
        if (!response) throw new Error('notfound.user.do.not.exists');

        return response;
    }
}