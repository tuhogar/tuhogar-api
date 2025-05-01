import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { UpdateFirebaseUsersDataUseCase } from '../user/update-firebase-users-data.use-case';
import { CreateInternalSubscriptionUseCase } from './create-internal-subscription.use-case';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';

/**
 * Caso de uso responsável por processar assinaturas com status CANCELLED_ON_PAYMENT_GATEWAY
 * cuja data efetiva de cancelamento já foi atingida
 * 
 * Este caso de uso é executado automaticamente a cada hora e realiza as seguintes operações:
 * 1. Busca assinaturas com status CANCELLED_ON_PAYMENT_GATEWAY e effectiveCancellationDate <= data atual
 * 2. Atualiza o status dessas assinaturas para CANCELLED
 * 3. Cria uma nova assinatura interna com o plano gratuito
 * 4. Ativa a nova assinatura
 * 5. Atualiza o plano da conta
 * 6. Chama o caso de uso UpdateFirebaseUsersDataUseCase para atualizar os dados dos usuários no Firebase
 */
@Injectable()
export class ProcessCancelledSubscriptionsUseCase {
  private readonly logger = new Logger(ProcessCancelledSubscriptionsUseCase.name);
  private readonly firstSubscriptionPlanId: string;

  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly updateFirebaseUsersDataUseCase: UpdateFirebaseUsersDataUseCase,
    private readonly createInternalSubscriptionUseCase: CreateInternalSubscriptionUseCase,
    private readonly accountRepository: IAccountRepository,
    private readonly configService: ConfigService
  ) {
    this.firstSubscriptionPlanId = this.configService.get<string>('FIRST_SUBSCRIPTION_PLAN_ID');
  }

  /**
   * Executa o processamento de assinaturas canceladas automaticamente a cada minuto
   */
  @Cron('* * * * *', {
    name: 'process-cancelled-subscriptions'
  })
  async executeScheduled(): Promise<void> {
    try {
      this.logger.log(`Iniciando processamento automático de assinaturas canceladas em ${new Date().toISOString()}`);
      await this.execute();
      this.logger.log(`Processamento automático de assinaturas canceladas concluído com sucesso em ${new Date().toISOString()}`);
    } catch (error) {
      this.logger.error(`Erro no processamento automático de assinaturas canceladas: ${error.message}`);
      // Não propagar o erro para não interromper outros jobs agendados
    }
  }

  /**
   * Executa o processamento de assinaturas canceladas
   * Pode ser chamado manualmente ou pelo agendamento
   */
  async execute(): Promise<void> {
    const currentDate = new Date();
    this.logger.log(`Buscando assinaturas canceladas com data efetiva de cancelamento <= ${currentDate.toISOString()}`);
    
    // Buscar assinaturas que precisam ser canceladas
    const subscriptionsToCancel = await this.subscriptionRepository.findSubscriptionsToCancel(currentDate);
    
    if (subscriptionsToCancel.length === 0) {
      this.logger.log('Nenhuma assinatura para cancelar');
      return;
    }
    
    this.logger.log(`Encontradas ${subscriptionsToCancel.length} assinaturas para cancelar`);
    
    // Processar cada assinatura
    for (const subscription of subscriptionsToCancel) {
      await this.processSubscription(subscription);
    }
  }

  /**
   * Processa uma assinatura individual, cancelando-a efetivamente e criando uma nova assinatura com o plano gratuito
   * @param subscription Assinatura a ser processada
   */
  private async processSubscription(subscription: Subscription): Promise<void> {
    try {
      this.logger.log(`Processando assinatura ${subscription.id} da conta ${subscription.accountId}`);
      
      // Atualizar o status da assinatura para CANCELLED
      await this.subscriptionRepository.cancel(subscription.id);
      
      // Criar nova assinatura interna com o plano gratuito
      const subscriptionCreated = await this.createInternalSubscriptionUseCase.execute({ 
        accountId: subscription.accountId, 
        planId: this.firstSubscriptionPlanId 
      });
      
      // Ativar a nova assinatura
      await this.subscriptionRepository.active(subscriptionCreated.id);
      
      // Atualizar o plano da conta
      await this.accountRepository.updatePlan(subscription.accountId, this.firstSubscriptionPlanId);
      
      // Atualizar dados dos usuários no Firebase
      await this.updateFirebaseUsersDataUseCase.execute({
        accountId: subscription.accountId
      });
      
      this.logger.log(`Assinatura ${subscription.id} processada com sucesso`);
    } catch (error) {
      this.logger.error(`Erro ao processar assinatura ${subscription.id}: ${error.message}`);
      // Continuar processando as próximas assinaturas mesmo em caso de erro
    }
  }
}
