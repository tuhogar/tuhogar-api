import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';

interface CreatePaymentUseCaseCommand {
  accountId: string;
  email: string;
  planId: string;
  token: string
}

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    //private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly planRepository: IPlanRepository,
    private readonly paymentGateway: IPaymentGateway,
  ) {}

  async execute(useCaseCommand: any) { //: Promise<Subscription> {
    //const exists = await this.subscriptionRepository.findByAccountId(accountId);
    // TODO:
    // Verificar se já existe uma assinatura para esta conta.
    // Se a assinatura estiver cancelada, o usuário poderá criar outra.
    // Se a assinatura estiver ativa ou pendente, o usuário náo poderá criar outra.
    // Para estes casos, retornar erro ao cliente dizendo que ele já possui uma assinatura válida ou pendente de pagamento.

    const plan = await this.planRepository.findById(useCaseCommand.planId);
    console.log('----plan');
    console.log(plan);
    console.log('----plan');

    const payment: any = {
      transaction_amount: 10, // plan.price,
      token: useCaseCommand.token,
      description: `plan.name to accountId: ${useCaseCommand.accountId}`,
      installments: useCaseCommand.installments,
      payment_method_id: useCaseCommand.payment_method_id,
      issuer_id: useCaseCommand.issuer_id,
      payer: { email: useCaseCommand.email }
    }

    const gatewayResponse = await this.paymentGateway.createPayment(payment);
    console.log('-------gatewayResponse');
    console.log(gatewayResponse);
    console.log('-------gatewayResponse');

    return;
    /*
    const subscription = new Subscription({
      accountId,
      planId,
      externalId: gatewayResponse.id,
      status: SubscriptionStatus.PENDING,
    });

    return await this.subscriptionRepository.create(subscription);
    */
  }
}
