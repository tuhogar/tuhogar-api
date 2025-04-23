import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRole, UserStatus } from 'src/domain/entities/user';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';
import { UpdateFirebaseUsersDataUseCase } from './update-firebase-users-data.use-case';

interface UpdateStatusUserUseCaseCommand {
    userRole: UserRole;
    accountId: string;
    userId: string;
    status: UserStatus;
}

@Injectable()
export class UpdateStatusUserUseCase {

    constructor(
        private readonly userRepository: IUserRepository,
        private readonly updateFirebaseUsersDataUseCase: UpdateFirebaseUsersDataUseCase,
    ) {}
    
    async execute({
        userRole,
        accountId,
        userId,
        status
    }: UpdateStatusUserUseCaseCommand): Promise<void> {

        const user = await this.userRepository.findOneById(userId);
        if (!user) throw new Error('notfound.user.do.not.exists');

        if (userRole !== UserRole.MASTER && accountId !== user.accountId) {
            throw new Error('notfound.user.do.not.exists');
        }

        const updatingUser = await this.userRepository.updateStatus(userId, status);

        if (!updatingUser) throw new Error('notfound.user.do.not.exists');

        try {
            await this.updateFirebaseUsersDataUseCase.execute({ accountId: updatingUser.accountId });
        } catch(error) {
            await this.userRepository.updateStatus(userId, updatingUser.status);

            throw new UnauthorizedException('authorization.error.updating.user.data.on.the.authentication.server');
        }
    }
}