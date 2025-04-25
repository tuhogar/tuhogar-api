import { Injectable } from '@nestjs/common';
import { FirebaseAdmin } from 'src/infraestructure/config/firebase.config';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';

interface UpdateFirebaseUsersDataUseCaseCommand {
    accountId: string;
}

@Injectable()
export class UpdateFirebaseUsersDataUseCase {
    constructor(
        private readonly admin: FirebaseAdmin,
        private readonly userRepository: IUserRepository,
        private readonly planRepository: IPlanRepository,
    ) {}

    async execute({ accountId }: UpdateFirebaseUsersDataUseCaseCommand): Promise<void> {
      const app = this.admin.setup();
  
      const users = await this.userRepository.findByAccountId(accountId);
  
      const updatePromises = users.map(async (user) => {
          try {
              // Buscar o plano para obter os limites de anúncios e fotos
              let maxAdvertisements = null;
              let maxPhotos = null;
              if (user.account?.subscription?.planId) {
                  try {
                      const plan = await this.planRepository.findOneById(user.account.subscription.planId);
                      if (plan) {
                          maxAdvertisements = plan.maxAdvertisements;
                          maxPhotos = plan.maxPhotos;
                      }
                  } catch (planError) {
                      console.error('error.fetching.plan.for.user.claims');
                      // Não deve estourar o erro ao buscar o plano
                  }
              }

              await app.auth().setCustomUserClaims(user.uid, {
                  userRole: user.userRole,
                  planId: user.account.subscription.planId,
                  maxAdvertisements: maxAdvertisements,
                  maxPhotos: maxPhotos,
                  subscriptionId: user.account.subscription.id,
                  subscriptionStatus: user.account.subscription.status,
                  accountId: user.account.id,
                  accountStatus: user.account.status,
                  userStatus: user.status,
                  userId: user.id,
              });
          } catch (error) {
              console.error('authorization.error.updating.user.data.on.the.authentication.server');
              // Não deve estourar o erro
          }
      });
  
      await Promise.all(updatePromises);
  }
  
}