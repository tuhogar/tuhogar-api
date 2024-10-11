import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';

interface CreateSubscriptionUseCaseCommand {
  accountId: string;
  email: string;
  planId: string;
  paymentData: Record<string, any>
}

@Injectable()
export class CreateSubscriptionUseCase {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly planRepository: IPlanRepository,
    private readonly paymentGateway: IPaymentGateway,
  ) {}

  async execute({ accountId, email, planId, paymentData }: CreateSubscriptionUseCaseCommand) { //: Promise<Subscription> {
    const exists = await this.subscriptionRepository.findByAccountId(accountId);
    // TODO:
    // Verificar se já existe uma assinatura para esta conta.
    // Se a assinatura estiver cancelada, o usuário poderá criar outra.
    // Se a assinatura estiver ativa ou pendente, o usuário náo poderá criar outra.
    // Para estes casos, retornar erro ao cliente dizendo que ele já possui uma assinatura válida ou pendente de pagamento.

    const plan = await this.planRepository.findById(planId);
    console.log('----plan');
    console.log(plan);
    console.log('----plan');





    // *************** TODO ***************
    // O pagamento deve ser realizado dentro do método paymentGateway.createSubscription
    // Pois o fluxo de criar primeiro um pagamento para depois criar uma assinatura é exclusividade do mercado pago
    const payment: any = {
      transaction_amount: 10, // plan.price,
      token: paymentData.token,
      description: `planId: ${plan.id}. accountId: ${accountId}`,
      installments: paymentData.installments,
      payment_method_id: paymentData.payment_method_id,
      issuer_id: paymentData.issuer_id,
      payer: { email: email }
    }

    const subscriptionPayment = await this.paymentGateway.createPayment(payment);
    console.log('-------subscriptionPayment');
    console.log(subscriptionPayment);
    console.log('-------subscriptionPayment');

    return;




    const externalSubscription: any = {
      preapproval_plan_id: plan.externalId,
      reason: plan.name,
      external_reference: accountId,
      payer_email: email,
      card_token_id: paymentData.token,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        start_date: new Date(),
        end_date: null,
        transaction_amount: 10, // plan.price,
        currency_id: 'BRL'
      },
    }

    // Criação da assinatura no gateway
    const gatewayResponse = await this.paymentGateway.createSubscription(externalSubscription);
    console.log('-------gatewayResponse');
    console.log(gatewayResponse);
    console.log('-------gatewayResponse');

    return;

    const subscription = new Subscription({
      accountId,
      planId,
      externalId: gatewayResponse.id,
      status: SubscriptionStatus.PENDING,
    });

    return await this.subscriptionRepository.create(subscription);
  }
}
