import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { ISubscriptionPaymentRepository } from 'src/application/interfaces/repositories/subscription-payment.repository.interface';
import { SubscriptionPaymentStatus } from 'src/domain/entities/subscription-payment';

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
    private readonly subscriptionPaymentRepository: ISubscriptionPaymentRepository,
    private readonly planRepository: IPlanRepository,
    private readonly paymentGateway: IPaymentGateway,
  ) {}

  async execute({ accountId, email, planId, paymentData }: CreateSubscriptionUseCaseCommand) { //: Promise<Subscription> {
    console.log('--------create-subscription-INICIO');
    const exists = await this.subscriptionRepository.findByAccountId(accountId);
    // TODO:
    // Verificar se já existe uma assinatura para esta conta.
    // Se a assinatura estiver cancelada, o usuário poderá criar outra.
    // Se a assinatura estiver ativa ou pendente, o usuário náo poderá criar outra.
    // Para estes casos, retornar erro ao cliente dizendo que ele já possui uma assinatura válida ou pendente de pagamento.

    const plan = await this.planRepository.findById(planId);

    const subscriptionCreated = await this.paymentGateway.createSubscription(accountId, email, plan, paymentData);
    if (!subscriptionCreated) throw new Error('error.on.create.subscription');

    await this.subscriptionRepository.create(subscriptionCreated);
    console.log('--------create-subscription-FIM');
  }
}
