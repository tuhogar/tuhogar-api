import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { ISubscriptionPaymentRepository } from 'src/application/interfaces/repositories/subscription-payment.repository.interface';
import { SubscriptionWithPayments } from 'src/domain/entities/subscription-with-payments';

/**
 * Comando para execução do caso de uso GetSubscriptionHistory
 */
export interface GetSubscriptionHistoryUseCaseCommand {
  /** ID da conta para buscar o histórico de assinaturas */
  accountId: string;
}

@Injectable()
export class GetSubscriptionHistoryUseCase {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly subscriptionPaymentRepository: ISubscriptionPaymentRepository,
  ) {}

  /**
   * Obtém o histórico completo de assinaturas de um usuário, incluindo os pagamentos relacionados
   * @param accountId ID da conta do usuário
   * @returns Array de assinaturas com seus respectivos pagamentos, ordenadas por data de criação (mais recentes primeiro)
   * @throws Error com prefixo 'notfound.' quando nenhuma assinatura é encontrada
   */
  async execute({ accountId }: GetSubscriptionHistoryUseCaseCommand): Promise<SubscriptionWithPayments[]> {
    // Busca todas as assinaturas do usuário
    const subscriptions = await this.subscriptionRepository.findAllByAccountId(accountId);

    // Se não encontrou assinaturas, lança um erro
    if (!subscriptions || subscriptions.length === 0) {
      throw new Error('notfound.subscription.history.do.not.exists');
    }

    // Para cada assinatura, busca os pagamentos relacionados
    const subscriptionsWithPayments: SubscriptionWithPayments[] = await Promise.all(
      subscriptions.map(async (subscription) => {
        // Busca os pagamentos da assinatura
        const payments = await this.subscriptionPaymentRepository.findAllBySubscriptionId(subscription.id);
        
        // Retorna a assinatura com os pagamentos
        return {
          ...subscription,
          payments: payments || []
        };
      })
    );

    // Retorna as assinaturas com pagamentos
    return subscriptionsWithPayments;
  }
}
