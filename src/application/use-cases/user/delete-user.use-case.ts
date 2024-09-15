import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRole } from 'src/domain/entities/user.interface';
import { FirebaseAdmin } from 'src/infraestructure/config/firebase.config';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user.interface';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';

@Injectable()
export class DeleteUserUseCase {
    private firebaseApiKey: string;

    constructor(
        private configService: ConfigService,
        private readonly admin: FirebaseAdmin,
        private readonly userRepository: IUserRepository,
    ) {
        this.firebaseApiKey = this.configService.get<string>('FIREBASE_API_KEY');
    }

    async execute(authenticatedUser: AuthenticatedUser, userId: string): Promise<void> {

        const filter = {
            _id: userId,
            ...(authenticatedUser.userRole !== UserRole.MASTER && { accountId: authenticatedUser.accountId })
        };

        const user = await this.userRepository.findOne(filter);
        if (!user) throw new Error('notfound.user.do.not.exists');

        await this.userRepository.deleteOne(filter);

        try {
            const app = this.admin.setup();
            await app.auth().deleteUser(user.uid);
        } catch(error) {
            throw new UnauthorizedException('authorization.error.deleting.user.data.on.the.authentication.server');
        }
    }
}