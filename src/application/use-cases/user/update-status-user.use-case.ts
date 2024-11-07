import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRole } from 'src/domain/entities/user';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { UpdateStatusUserDto } from 'src/infraestructure/http/dtos/user/update-status-user.dto';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';
import { UpdateFirebaseUsersDataUseCase } from './update-firebase-users-data.use-case';

@Injectable()
export class UpdateStatusUserUseCase {

    constructor(
        private readonly userRepository: IUserRepository,
        private readonly updateFirebaseUsersDataUseCase: UpdateFirebaseUsersDataUseCase,
    ) {}
    
    async execute(
        authenticatedUser: AuthenticatedUser,
        userId: string,
        updateStatusUserDto: UpdateStatusUserDto,
    ): Promise<void> {

        const filter = {
            _id: userId,
            ...(authenticatedUser.userRole !== UserRole.MASTER && { accountId: authenticatedUser.accountId })
        };

        const updatingUser = await this.userRepository.findOneAndUpdate(filter, { ...updateStatusUserDto });

        if (!updatingUser) throw new Error('notfound.user.do.not.exists');

        try {
            await this.updateFirebaseUsersDataUseCase.execute( { accountId: updatingUser.accountId });
        } catch(error) {
            await this.userRepository.findOneAndUpdate(filter, { status: updatingUser.status });

            throw new UnauthorizedException('authorization.error.updating.user.data.on.the.authentication.server');
        }
    }
}