import { Injectable } from '@nestjs/common';
import { UserRole, UserStatus } from 'src/domain/entities/user';
import { AccountStatus } from 'src/domain/entities/account';
import { UpdateStatusUserUseCase } from './update-status-user.use-case';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';

interface UpdateAllUserStatusUseCaseCommand {
    userRole: UserRole;
    accountId: string;
    status: AccountStatus;
}

@Injectable()
export class UpdateAllUserStatusUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly updateStatusUserUseCase: UpdateStatusUserUseCase,
    ) {}

    async execute({
        userRole,
        accountId,
        status
    }: UpdateAllUserStatusUseCaseCommand): Promise<void> {
        const users = await this.userRepository.findByAccountIdAndUserRole(accountId, status === AccountStatus.ACTIVE ? UserRole.ADMIN : undefined);
    
        const updatePromises = users.map((user) => {
            const userStatus = status === AccountStatus.ACTIVE ? UserStatus.ACTIVE : UserStatus.INACTIVE;
            return this.updateStatusUserUseCase.execute({
                userRole,
                accountId,
                userId: user.id,
                status: userStatus
            });
        });
    
        await Promise.all(updatePromises);
    }
}