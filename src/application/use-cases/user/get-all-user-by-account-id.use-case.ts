import { Injectable } from '@nestjs/common';
import { User } from 'src/domain/entities/user';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';

interface GetAllUserByAccountIdUseCaseCommand {
    accountId: string;
}

@Injectable()
export class GetAllUserByAccountIdUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
    ) {}

    async execute({
        accountId
    }: GetAllUserByAccountIdUseCaseCommand): Promise<User[]> {
        return this.userRepository.findByAccountId(accountId);
    }
}