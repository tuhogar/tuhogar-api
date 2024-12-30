import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { ISubscriptionNotificationRepository } from 'src/application/interfaces/repositories/subscription-notification.repository.interface';
import { SubscriptionNotification, SubscriptionNotificationAction, SubscriptionNotificationType } from 'src/domain/entities/subscription-notification';
import { ReceiveSubscriptionInvoiceNotificationUseCase } from './receive-subscription-invoice-notification.use-case';
import { ReceiveSubscriptionPaymentNotificationUseCase } from './receive-subscription-payment-notification.use-case';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { UpdateFirebaseUsersDataUseCase } from '../user/update-firebase-users-data.use-case';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';

@Injectable()
export class ReceiveSubscriptionNotificationUseCase {
  constructor(
    private readonly receiveSubscriptionInvoiceNotificationUseCase: ReceiveSubscriptionInvoiceNotificationUseCase,
    private readonly receiveSubscriptionPaymentNotificationUseCase: ReceiveSubscriptionPaymentNotificationUseCase,
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly userRepository: IUserRepository,
    private readonly subscriptionNotificationRepository: ISubscriptionNotificationRepository,
    private readonly updateFirebaseUsersDataUseCase: UpdateFirebaseUsersDataUseCase,
    private readonly paymentGateway: IPaymentGateway,
  ) {}

  async execute(payload: any): Promise<void> {
    const subscriptionNotification = await this.getSubscriptionNotification(payload);

    switch(subscriptionNotification.type) {
      case SubscriptionNotificationType.SUBSCRIPTION:
        await this.receiveSubscriptionNotification(subscriptionNotification);
        break;
      case SubscriptionNotificationType.PAYMENT:
        await this.receiveSubscriptionPaymentNotificationUseCase.execute(subscriptionNotification);
        break;
      case SubscriptionNotificationType.INVOICE:
        await this.receiveSubscriptionInvoiceNotificationUseCase.execute(subscriptionNotification);
        break;
      default:
        break;
    }
  }

  async receiveSubscriptionNotification(subscriptionNotification: SubscriptionNotification): Promise<void> {
    const subscriptionNotificated = await this.paymentGateway.getSubscription(subscriptionNotification);
    console.log('-----subscriptionNotificated');
    console.log(subscriptionNotificated);
    console.log('-----subscriptionNotificated');

    if (!subscriptionNotificated) {
      console.log('NAO ENCONTROU A ASSINATURA NO SERVICO EXTERNO');
      throw new Error('notfound.subscription.notificated.do.not.exists');
    }

    let subscription: Subscription;
    if (subscriptionNotificated.id) {
      subscription = await this.subscriptionRepository.findOneById(subscriptionNotificated.id);
    } else if (subscriptionNotificated.externalId) {
      subscription = await this.subscriptionRepository.findOneByExternalId(subscriptionNotificated.externalId);
    }

    if (!subscription) {
      console.log('NAO ENCONTROU A ASSINATURA NA BASE DE DADOS');
      throw new Error('notfound.subscription.do.not.exists');
    }

    if (subscriptionNotification.action == SubscriptionNotificationAction.CREATE && subscriptionNotificated.status === SubscriptionStatus.ACTIVE) {
      console.log('ATIVA A ASSINATURA');
      await this.subscriptionRepository.active(subscription.id);
      await this.updateFirebaseUsersDataUseCase.execute({ accountId: subscription.accountId });

      // TODO: AGUARDAR PAGAMENTO REJEITADO PARA VER COMO A ASSINATURA SE COMPORTA
    } else if (subscriptionNotification.action == SubscriptionNotificationAction.UPDATE) {
      switch (subscriptionNotificated.status) {
        case SubscriptionStatus.CANCELLED:
            console.log('CANCELA A ASSINATURA');
            // OBSERVAÇÃO: Cancelar a assinatura não modifica o status da account
            await this.subscriptionRepository.cancel(subscription.id);
            await this.updateFirebaseUsersDataUseCase.execute({ accountId: subscription.accountId });
            
            break;
        case SubscriptionStatus.ACTIVE:
            console.log('ATIVA A ASSINATURA');
            await this.subscriptionRepository.active(subscription.id);
            await this.updateFirebaseUsersDataUseCase.execute({ accountId: subscription.accountId });
            break;
        default:
            break;
      }
    }
  }

  async getSubscriptionNotification(payload: any): Promise<SubscriptionNotification> {
    const subscriptionNotification = await this.paymentGateway.getSubscriptionNotification(payload);
    const subscriptionNotificationCreated = await this.subscriptionNotificationRepository.create(subscriptionNotification);

    return subscriptionNotificationCreated;
  }
}
