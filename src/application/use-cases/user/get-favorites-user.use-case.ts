import { Injectable } from '@nestjs/common';
import { Advertisement } from 'src/domain/entities/advertisement';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';

interface GetFavoritesUserUseCaseCommand {
    userId: string;
}

@Injectable()
export class GetFavoritesUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
    ) {}

    async execute({
        userId
    }: GetFavoritesUserUseCaseCommand): Promise<Advertisement[]> {
        const user = await this.userRepository.findOneById(userId);
        if (!user) throw new Error('notfound.user.do.not.exists');

        return user.advertisementFavorites as Advertisement[];
    }
}