import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';
import { User } from 'src/domain/entities/user';

@Injectable()
export class CreateFavoriteUserUseCase {
    private firebaseApiKey: string;

    constructor(
        private configService: ConfigService,
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(userId: string, advertisementId: string): Promise<User> {
        const response = await this.userRepository.addFavoriteAdvertisement(userId, advertisementId);
        if (!response) throw new Error('notfound.user.do.not.exists');

        return response;
    }
}