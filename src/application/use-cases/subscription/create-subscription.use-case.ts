import { Injectable } from '@nestjs/common';
//import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
//import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
//import { Subscription } from 'src/domain/entities/subscription';

interface CreateSubscriptionUseCaseCommand {
  accountId: string;
  planId: string;
}

@Injectable()
export class CreateSubscriptionUseCase {
  constructor(
    //private readonly subscriptionRepository: ISubscriptionRepository,
    //private readonly paymentGateway: IPaymentGateway,
  ) {}

  async execute({ accountId, planId }: CreateSubscriptionUseCaseCommand) { //: Promise<Subscription> {
    /*const exists = await this.subscriptionRepository.findByAccountId(accountId);
    // TODO:
    // Verificar se já existe uma assinatura para esta conta.
    // Se a assinatura estiver cancelada, o usuário poderá criar outra.
    // Se a assinatura estiver ativa ou pendente, o usuário náo poderá criar outra.
    // Para estes casos, retornar erro ao cliente dizendo que ele já possui uma assinatura válida ou pendente de pagamento.

    // Criação da assinatura no gateway
    const gatewayResponse = await this.paymentGateway.createSubscription({
      accountId,
      planId,
    });

    const subscription = new Subscription({
      accountId,
      planId,
      externalId: gatewayResponse.id,
      status: 'pending',
    });

    return await this.subscriptionRepository.create(subscription);
    */
  }
}
