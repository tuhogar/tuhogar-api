import { Injectable } from '@nestjs/common';
import { User, UserRole, UserStatus } from 'src/domain/entities/user';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';

@Injectable()
export class GetAllByAccountIdUserUseCase {
    constructor(
        private configService: ConfigService,
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(accountId: string, userRole?: UserRole): Promise<User[]> {
        const filter = { accountId, ...(userRole && { userRole }) };
        
        return this.userRepository.find(filter);
    }
}