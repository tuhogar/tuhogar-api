import { Injectable } from '@nestjs/common';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';

@Injectable()
export class DeleteFavoriteUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(userId: string, advertisementId: string): Promise<void> {
        const user = await this.userRepository.findOneAndUpdate({ _id: userId }, { $pull: { advertisementFavorites: advertisementId } }, true);
    
        if (!user) {
            if (!user) throw new Error('notfound.user.do.not.exists');
        }
    }
}