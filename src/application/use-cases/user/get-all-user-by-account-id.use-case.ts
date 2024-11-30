import { Injectable } from '@nestjs/common';
import { User, UserRole, UserStatus } from 'src/domain/entities/user';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';

@Injectable()
export class GetAllUserByAccountIdUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(accountId: string): Promise<User[]> {
        
        return this.userRepository.findByAccountId(accountId);
    }
}