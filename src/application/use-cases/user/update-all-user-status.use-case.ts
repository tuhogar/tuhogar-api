import { Injectable } from '@nestjs/common';
import { UserRole, UserStatus } from 'src/domain/entities/user';
import { AccountStatus } from 'src/domain/entities/account';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { UpdateStatusUserDto } from 'src/infraestructure/http/dtos/user/update-status-user.dto';
import { UpdateStatusUserUseCase } from './update-status-user.use-case';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';

@Injectable()
export class UpdateAllUserStatusUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly updateStatusUserUseCase: UpdateStatusUserUseCase,
    ) {}

    async execute(authenticatedUser: AuthenticatedUser, accountId: string, status: AccountStatus): Promise<void> {
        const users = await this.userRepository.findByAccountIdAndUserRole(accountId, status === AccountStatus.ACTIVE ? UserRole.ADMIN : undefined);
    
        const updatePromises = users.map((user) => {
            const updateStatusUserDto: UpdateStatusUserDto = { status: status === AccountStatus.ACTIVE ? UserStatus.ACTIVE : UserStatus.INACTIVE };
            return this.updateStatusUserUseCase.execute(authenticatedUser, user.id, updateStatusUserDto);
        });
    
        await Promise.all(updatePromises);
    }
}