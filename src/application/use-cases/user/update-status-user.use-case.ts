import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRole } from 'src/domain/entities/user';
import { FirebaseAdmin } from 'src/infraestructure/config/firebase.config';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { UpdateStatusUserDto } from 'src/infraestructure/http/dtos/user/update-status-user.dto';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';

@Injectable()
export class UpdateStatusUserUseCase {

    constructor(
        private readonly admin: FirebaseAdmin,
        private readonly userRepository: IUserRepository,
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
            const app = this.admin.setup();
            await app.auth().setCustomUserClaims(updatingUser.uid, { 
                userRole: updatingUser.userRole,
                planId: updatingUser.account.planId.toString(),
                accountId: updatingUser.accountId.toString(),
                accountStatus: updatingUser.account.status,
                userStatus: updateStatusUserDto.status,
                userId: updatingUser.id,
                
            });
        } catch(error) {
            await this.userRepository.findOneAndUpdate(filter, { status: updatingUser.status });

            throw new UnauthorizedException('authorization.error.updating.user.data.on.the.authentication.server');
        }
    }
}