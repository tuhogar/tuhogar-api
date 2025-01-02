import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseAdmin } from 'src/infraestructure/config/firebase.config';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';
import { User, UserRole, UserStatus } from 'src/domain/entities/user';

interface CreateUserMasterUseCaseCommand {
    name: string,
    email: string
    uid: string
}

@Injectable()
export class CreateUserMasterUseCase {
    constructor(
        private readonly admin: FirebaseAdmin,
        private readonly userRepository: IUserRepository,
    ) {}

    async execute({ name, email, uid }: CreateUserMasterUseCaseCommand): Promise<void> {
        const user = new User({
            name,
            email,
            uid,
            userRole: UserRole.MASTER,
            status: UserStatus.ACTIVE,
            accountId: undefined
         });

        const userCreated = await this.userRepository.createMaster(user);
        
        try {
            const app = this.admin.setup();
            await app.auth().setCustomUserClaims(uid, { 
                userRole: UserRole.MASTER,
                userStatus: userCreated.status,
                userId: userCreated.id,
            });
        } catch(error) {
            await this.userRepository.delete(userCreated.id);
            throw new UnauthorizedException('authorization.error.updating.user.data.on.the.authentication.server');
        }
    }
}