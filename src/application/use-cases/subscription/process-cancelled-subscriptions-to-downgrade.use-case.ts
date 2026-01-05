import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { Subscription } from 'src/domain/entities/subscription';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { CreateSubscriptionUseCase } from './create-subscription.use-case';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';

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
export class ProcessCancelledSubscriptionsToDowngradeUseCase {
  private readonly logger = new Logger(ProcessCancelledSubscriptionsToDowngradeUseCase.name);

  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly createSubscriptionUseCase: CreateSubscriptionUseCase,
    private readonly configService: ConfigService,
    private readonly accountRepository: IAccountRepository,
    private readonly paymentGateway: IPaymentGateway,
  ) {}

  /**
   * Executa o processamento de assinaturas canceladas automaticamente a cada minuto
   */
  @Cron('* * * * *', {
    name: 'process-cancelled-subscriptions-to-downgrade'
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
      this.logger.error(`Erro no processamento automático de assinaturas canceladas para downgrade: ${error.message}`);
      // Não propagar o erro para não interromper outros jobs agendados
    }
  }

  /**
   * Executa o processamento de assinaturas canceladas
   * Pode ser chamado manualmente ou pelo agendamento
   */
  async execute(): Promise<void> {
    this.logger.log('Iniciando processamento de assinaturas canceladas para downgrade');
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
    const subscriptionsToCancel = await this.subscriptionRepository.findSubscriptionsToCancelAndDowngrade(currentDate);
    
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
      this.logger.log(`Processando cancelamento de assinatura ${subscription.id} com downgrade da conta ${subscription.accountId}`);
      
      // Atualizar o status da assinatura para CANCELLED
      await this.subscriptionRepository.cancel(subscription.id);

      // Se já tiver uma assinatura ativa, não criar uma nova
      const subscriptionActive = await this.subscriptionRepository.findOneActiveByAccountId(subscription.accountId);
      if (subscriptionActive) {
        this.logger.log(`Conta ${subscription.accountId} já possui uma assinatura ativa`);
        return;
      }

      const account = await this.accountRepository.findOneByIdWithPaymentData(subscription.accountId);
      if (!account) throw new Error('invalid.account.do.not.exists');

      const customer = await this.paymentGateway.getCustomer(subscription.externalPayerReference);
      if (!customer) throw new Error('invalid.customer.do.not.exists');
      
      // Criar nova assinatura interna com o plano gratuito
      await this.createSubscriptionUseCase.execute({ 
          actualSubscriptionId: subscription.id, 
          actualSubscriptionStatus: subscription.status, 
          actualPlanId: subscription.planId, 
          accountId: subscription.accountId, 
          planId: subscription.newPlanId, 
          paymentData: {
            token: account.paymentToken,
            docType: customer.data.doc_type,
            docNumber: customer.data.doc_number,
            phone: customer.data.phone,
          }, 
        });
      
      this.logger.log(`Cancelamento de assinatura ${subscription.id} com downgrade processada com sucesso`);
    } catch (error) {
      this.logger.error(`Erro ao processar cancelamento assinatura ${subscription.id} com downgrade: ${error.message}`);
      // Continuar processando as próximas assinaturas mesmo em caso de erro
    }
  }
}
