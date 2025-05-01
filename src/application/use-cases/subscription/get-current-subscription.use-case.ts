import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { Subscription } from 'src/domain/entities/subscription';
import { SubscriptionWithRemainingFreeDays } from 'src/domain/entities/subscription-with-remaining-free-days';

/**
 * Comando para execução do caso de uso GetCurrentSubscription
 */
export interface GetCurrentSubscriptionUseCaseCommand {
  /** ID da conta para buscar a assinatura atual */
  accountId: string;
}

@Injectable()
export class GetCurrentSubscriptionUseCase {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly planRepository: IPlanRepository,
  ) {}
  
  /**
   * Calcula o número de dias entre duas datas
   * Método protegido para permitir substituição nos testes
   * @param startDate Data inicial
   * @param endDate Data final
   * @returns Número de dias entre as datas
   */
  protected calculateDaysBetween(startDate: Date, endDate: Date): number {
    return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtém a assinatura atual (mais recente) do usuário, incluindo informações sobre dias gratuitos restantes
   * @param accountId ID da conta do usuário
   * @returns Assinatura atual do usuário com informações de dias gratuitos restantes
   * @throws Error com prefixo 'notfound.' quando a assinatura não é encontrada
   */
  async execute({ accountId }: GetCurrentSubscriptionUseCaseCommand): Promise<SubscriptionWithRemainingFreeDays> {
    // Busca a assinatura mais recente do usuário
    const subscription = await this.subscriptionRepository.findMostRecentByAccountId(accountId);

    // Se não encontrou assinatura, lança um erro
    if (!subscription) {
      throw new Error('notfound.subscription.do.not.exists');
    }
    
    // Busca o plano associado à assinatura
    const plan = await this.planRepository.findOneById(subscription.planId);
    
    // Calcula os dias gratuitos restantes
    let remainingFreeDays = 0;
    
    if (plan && plan.freeTrialDays && plan.freeTrialDays > 0) {
      // Dias totais do período gratuito
      const totalFreeDays = plan.freeTrialDays;
      
      // Calcular os dias decorridos desde a criação da assinatura
      const currentDate = new Date();
      const creationDate = new Date(subscription.createdAt);
      const daysSinceCreation = this.calculateDaysBetween(creationDate, currentDate);
      
      // Calcular dias restantes (0 se o período já expirou)
      remainingFreeDays = daysSinceCreation >= totalFreeDays ? 0 : totalFreeDays - daysSinceCreation;
    }
    
    // Retorna a assinatura com a informação de dias gratuitos restantes
    return {
      ...subscription,
      remainingFreeDays
    };
  }
}
