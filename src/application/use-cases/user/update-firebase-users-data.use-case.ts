import { Injectable } from '@nestjs/common';
import { FirebaseAdmin } from 'src/infraestructure/config/firebase.config';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';

interface UpdateFirebaseUsersDataUseCaseCommand {
    accountId: string;
}

@Injectable()
export class UpdateFirebaseUsersDataUseCase {
    constructor(
        private readonly admin: FirebaseAdmin,
        private readonly userRepository: IUserRepository,
    ) {}

    async execute({ accountId }: UpdateFirebaseUsersDataUseCaseCommand): Promise<void> {
        const app = this.admin.setup();

        const users = await this.userRepository.findByAccountId(accountId);
        users.forEach(async (a) => {
          try {
            await app.auth().setCustomUserClaims(a.uid, { 
                userRole: a.userRole,
                planId: a.account.subscription.planId,
                subscriptionId: a.account.subscription.id,
                subscriptionStatus: a.account.subscription.status,
                accountId: a.account.id,
                accountStatus: a.account.status,
                userStatus: a.status,
                userId: a.id,
            });
          } catch(error) {
            console.error('authorization.error.updating.user.data.on.the.authentication.server');
            // Não deve estourar o erro
          }
        });
    }
}