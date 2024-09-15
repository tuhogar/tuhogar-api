import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';

@Injectable()
export class CreateFavoriteUserUseCase {
    private firebaseApiKey: string;

    constructor(
        private configService: ConfigService,
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(userId: string, advertisementId: string): Promise<void> {
        const user = await this.userRepository.findOneAndUpdate({ _id: userId }, { $addToSet: { advertisementFavorites: advertisementId } }, true);
      
          if (!user) throw new Error('notfound.user.do.not.exists');
    }
}