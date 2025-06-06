import { Injectable } from '@nestjs/common';
import { User } from 'src/domain/entities/user';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';

interface GetMeUserUseCaseCommand {
    uid: string;
}

@Injectable()
export class GetMeUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
    ) {}

    async execute({
        uid
    }: GetMeUserUseCaseCommand): Promise<User> {
        const user = await this.userRepository.findOneByUid(uid);
        if (!user) throw new Error('notfound.user.do.not.exists');

        return user;
    }
}