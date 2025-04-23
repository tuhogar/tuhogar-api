import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRole } from 'src/domain/entities/user';
import { FirebaseAdmin } from 'src/infraestructure/config/firebase.config';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';

interface DeleteUserUseCaseCommand {
    userRole: UserRole;
    accountId: string;
    userId: string;
}

@Injectable()
export class DeleteUserUseCase {
    constructor(
        private readonly admin: FirebaseAdmin,
        private readonly userRepository: IUserRepository,
    ) {}

    async execute({
        userRole,
        accountId,
        userId
    }: DeleteUserUseCaseCommand): Promise<void> {

        const user = await this.userRepository.findOneById(userId);
        if (!user) throw new Error('notfound.user.do.not.exists');

        if (userRole !== UserRole.MASTER && accountId !== user.accountId) {
            throw new Error('notfound.user.do.not.exists');
        }

        await this.userRepository.delete(userId);

        try {
            const app = this.admin.setup();
            await app.auth().deleteUser(user.uid);
        } catch(error) {
            throw new UnauthorizedException('authorization.error.deleting.user.data.on.the.authentication.server');
        }
    }
}