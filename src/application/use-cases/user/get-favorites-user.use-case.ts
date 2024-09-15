import { Injectable } from '@nestjs/common';
import { Advertisement } from 'src/domain/entities/advertisement.interface';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';

@Injectable()
export class GetFavoritesUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(userId: string): Promise<Advertisement[]> {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new Error('notfound.user.do.not.exists');

        return user.advertisementFavorites as Advertisement[];
    }
}