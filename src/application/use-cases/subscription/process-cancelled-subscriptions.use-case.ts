import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { UpdateFirebaseUsersDataUseCase } from '../user/update-firebase-users-data.use-case';
import { CreateInternalSubscriptionUseCase } from './create-internal-subscription.use-case';
import { AdjustAdvertisementsAfterPlanChangeUseCase } from '../advertisement/adjust-advertisements-after-plan-change.use-case';
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
    private readonly adjustAdvertisementsAfterPlanChangeUseCase: AdjustAdvertisementsAfterPlanChangeUseCase,
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
      // Criar data atual em UTC para os logs
      const startDate = new Date(Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate(),
        new Date().getUTCHours(),
        new Date().getUTCMinutes(),
        new Date().getUTCSeconds(),
        new Date().getUTCMilliseconds()
      ));
      
      await this.execute();
      
      // Criar nova data UTC para o log de conclusão
      const endDate = new Date(Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate(),
        new Date().getUTCHours(),
        new Date().getUTCMinutes(),
        new Date().getUTCSeconds(),
        new Date().getUTCMilliseconds()
      ));
      
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
    // Criar data atual em UTC explicitamente
    const now = new Date();
    const currentDate = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
      now.getUTCMilliseconds()
    ));
    
    // Buscar assinaturas que precisam ser canceladas
    const subscriptionsToCancel = await this.subscriptionRepository.findSubscriptionsToCancel(currentDate);
    
    if (subscriptionsToCancel.length === 0) {
      return;
    }
    
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

      // Se já tiver uma assinatura ativa, não criar uma nova
      const subscriptionActive = await this.subscriptionRepository.findOneActiveByAccountId(subscription.accountId);
      if (subscriptionActive) {
        this.logger.log(`Conta ${subscription.accountId} já possui uma assinatura ativa`);
        return;
      }
      
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

      //await this.adjustAdvertisementsAfterPlanChangeUseCase.execute({ accountId: subscription.accountId, planId: this.firstSubscriptionPlanId });
      
      this.logger.log(`Assinatura ${subscription.id} processada com sucesso`);
    } catch (error) {
      this.logger.error(`Erro ao processar assinatura ${subscription.id}: ${error.message}`);
      // Continuar processando as próximas assinaturas mesmo em caso de erro
    }
  }
}
