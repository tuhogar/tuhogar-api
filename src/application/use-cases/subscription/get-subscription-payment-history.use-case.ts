import { Injectable } from '@nestjs/common';
import { ISubscriptionPaymentRepository } from 'src/application/interfaces/repositories/subscription-payment.repository.interface';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { SubscriptionPaymentWithSubscription } from 'src/domain/entities/subscription-payment-with-subscription';

/**
 * Comando para execução do caso de uso GetSubscriptionPaymentHistory
 */
export interface GetSubscriptionPaymentHistoryUseCaseCommand {
  /** ID da conta para buscar o histórico de pagamentos */
  accountId: string;
  /** Número da página (começando em 1) */
  page: number;
  /** Quantidade de itens por página */
  limit: number;
}

@Injectable()
export class GetSubscriptionPaymentHistoryUseCase {
  constructor(
    private readonly subscriptionPaymentRepository: ISubscriptionPaymentRepository,
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly planRepository: IPlanRepository,
  ) {}

  /**
   * Obtém o histórico de pagamentos de assinaturas de um usuário com paginação
   * @param command Comando com accountId, page e limit
   * @returns Objeto contendo array de pagamentos com suas assinaturas e planos, e contagem total
   * @throws Error com prefixo 'notfound.' quando nenhum pagamento é encontrado
   */
  async execute({ accountId, page, limit }: GetSubscriptionPaymentHistoryUseCaseCommand): Promise<{ data: SubscriptionPaymentWithSubscription[], count: number }> {
    // Busca os pagamentos paginados
    const { data: payments, count } = await this.subscriptionPaymentRepository.findAllByAccountIdPaginated(accountId, page, limit);

    // Se não encontrou pagamentos, lança um erro
    if (!payments || payments.length === 0) {
      throw new Error('notfound.subscription.payment.history.do.not.exists');
    }

    // Para cada pagamento, busca a assinatura e o plano associados
    const paymentsWithSubscription: SubscriptionPaymentWithSubscription[] = await Promise.all(
      payments.map(async (payment) => {
        // Se não tem ID da assinatura, retorna o pagamento sem assinatura
        if (!payment.subscriptionId) {
          return {
            ...payment,
            subscription: undefined
          };
        }

        // Busca a assinatura associada ao pagamento
        const subscription = await this.subscriptionRepository.findOneById(payment.subscriptionId);
        
        // Se não encontrou a assinatura, retorna o pagamento sem assinatura
        if (!subscription) {
          return {
            ...payment,
            subscription: undefined
          };
        }

        // Se a assinatura tem planId, busca o plano
        if (subscription.planId) {
          const plan = await this.planRepository.findOneById(subscription.planId);
          
          // Adiciona o plano à assinatura
          if (plan) {
            subscription.plan = plan;
          }
        }

        // Retorna o pagamento com a assinatura
        return {
          ...payment,
          subscription
        };
      })
    );

    // Retorna os pagamentos com assinaturas e a contagem total
    return {
      data: paymentsWithSubscription,
      count
    };
  }
}
