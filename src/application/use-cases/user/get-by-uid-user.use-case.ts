import { Injectable } from '@nestjs/common';
import { User } from 'src/domain/entities/user.interface';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';

@Injectable()
export class GetByUidUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(uid: string): Promise<User> {
        const user = await this.userRepository.findOne({ uid });
        if (!user) throw new Error('notfound.user.do.not.exists');

        return user;
    }
}