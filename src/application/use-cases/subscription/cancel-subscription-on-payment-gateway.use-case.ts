import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { SubscriptionStatus } from 'src/domain/entities/subscription';
import { CreateInternalSubscriptionUseCase } from './create-internal-subscription.use-case';
import { ConfigService } from '@nestjs/config';
import { UpdateFirebaseUsersDataUseCase } from '../user/update-firebase-users-data.use-case';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';

interface CancelSubscriptionOnPaymentGatewayUseCaseCommand {
  id: string;
  accountId: string;
}

@Injectable()
export class CancelSubscriptionOnPaymentGatewayUseCase {
  private readonly firstSubscriptionPlanId: string;
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly createInternalSubscriptionUseCase: CreateInternalSubscriptionUseCase,
    private readonly updateFirebaseUsersDataUseCase: UpdateFirebaseUsersDataUseCase,
    private readonly configService: ConfigService,
    private readonly accountRepository: IAccountRepository,
  ){
    this.firstSubscriptionPlanId = this.configService.get<string>('FIRST_SUBSCRIPTION_PLAN_ID');
  }

  async execute({ id, accountId }: CancelSubscriptionOnPaymentGatewayUseCaseCommand): Promise<void> {
      const subscription = await this.subscriptionRepository.findOneById(id);
      if (!subscription || subscription.planId === this.firstSubscriptionPlanId || (subscription && subscription.status !== SubscriptionStatus.ACTIVE && subscription.status !== SubscriptionStatus.PENDING)) throw new Error('error.subscription.do.not.exists');

      const externalSubscriptionCanceled = await this.paymentGateway.cancelSubscription(subscription.externalId);
      if (!externalSubscriptionCanceled) throw new Error('error.subscription.cancel.on.payment.gateway.failed');
      
      // Calcular a data efetiva de cancelamento
      let effectiveCancellationDate = subscription.nextPaymentDate;
      
      /*
      if (subscription.paymentDate) {
        // Se houver data de pagamento, usa ela como base e adiciona 1 dia (para testes)
        console.log(`Usando data de pagamento ${subscription.paymentDate.toISOString()} como base para cálculo da data efetiva de cancelamento`);
        effectiveCancellationDate = new Date(subscription.paymentDate);
        effectiveCancellationDate.setDate(effectiveCancellationDate.getDate() + 2); // Adiciona 1 dia para testes TODO: Modificar para 30 dias
      } else {
        // Se não houver data de pagamento, cancela imediatamente
        console.log('Data de pagamento não disponível, cancelando imediatamente');
        // Criar data em UTC explicitamente
        effectiveCancellationDate = new Date(Date.UTC(
          new Date().getUTCFullYear(),
          new Date().getUTCMonth(),
          new Date().getUTCDate(),
          new Date().getUTCHours(),
          new Date().getUTCMinutes(),
          new Date().getUTCSeconds(),
          new Date().getUTCMilliseconds()
      ));
        console.log(`Data atual em UTC: ${effectiveCancellationDate.toISOString()}`);
      }
      */
      
      console.log(`Data efetiva de cancelamento calculada: ${effectiveCancellationDate.toISOString()}`);
      
      // Cancelar a assinatura no gateway de pagamento e definir a data efetiva de cancelamento
      await this.subscriptionRepository.cancelOnPaymentGateway(id, effectiveCancellationDate);
      
      // Atualizar dados dos usuários no Firebase
      await this.updateFirebaseUsersDataUseCase.execute({ accountId });
  }
}
