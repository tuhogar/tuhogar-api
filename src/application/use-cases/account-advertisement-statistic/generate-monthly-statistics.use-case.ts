import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { IAccountAdvertisementStatisticsRepository } from 'src/application/interfaces/repositories/account-advertisement-statistics.repository.interface';
import { AccountAdvertisementStatistics, AdvertisementMetric, ContactInfoClicks, MetricBase, PhoneClicks, PropertyTypeAndTransactionMetrics, TopAdvertisements, TotalAdvertisements, TotalVisits, TransactionTypeMetrics } from 'src/domain/entities/account-advertisement-statistics';
import { Advertisement, AdvertisementTransactionType, AdvertisementType } from 'src/domain/entities/advertisement';
import { Account } from 'src/domain/entities/account';

interface GenerateMonthlyStatisticsUseCaseCommand {
  month?: string; // Formato: "YYYY-MM", se não fornecido, usa o mês anterior ao atual
  accountId?: string; // Se fornecido, gera estatísticas apenas para esta conta
}

@Injectable()
export class GenerateMonthlyStatisticsUseCase {
  private readonly logger = new Logger(GenerateMonthlyStatisticsUseCase.name);

  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly advertisementRepository: IAdvertisementRepository,
    private readonly accountAdvertisementStatisticsRepository: IAccountAdvertisementStatisticsRepository,
  ) {}

  /**
   * Executa a geração de estatísticas mensais automaticamente
   * no primeiro dia de cada mês às 00:00
   */
  @Cron('0 0 1 * *', {
    name: 'generate-monthly-statistics',
    timeZone: 'America/Sao_Paulo',
  })
  async executeScheduled(): Promise<void> {
    try {
      this.logger.log('Iniciando geração automática de estatísticas mensais');
      await this.execute();
      this.logger.log('Geração automática de estatísticas mensais concluída com sucesso');
    } catch (error) {
      this.logger.error(`Erro na geração automática de estatísticas mensais: ${error.message}`);
      // Não propagar o erro para não interromper outros jobs agendados
    }
  }

  async execute(command?: GenerateMonthlyStatisticsUseCaseCommand): Promise<void> {
    const { month = this.getPreviousMonth(), accountId } = command || {};
    
    try {
      if (accountId) {
        // Gerar estatísticas para uma conta específica
        const account = await this.accountRepository.findOneById(accountId);
        if (!account) {
          throw new Error('notfound.account.do.not.exists');
        }
        await this.generateStatisticsForAccount(account, month);
      } else {
        // Gerar estatísticas para todas as contas ativas
        const activeAccounts = await this.accountRepository.findActives();
        
        this.logger.log(`Gerando estatísticas para ${activeAccounts.length} contas ativas para o mês ${month}`);
        
        for (const account of activeAccounts) {
          try {
            await this.generateStatisticsForAccount(account, month);
          } catch (error) {
            // Registrar erro, mas continuar com as próximas contas
            this.logger.error(`Erro ao gerar estatísticas para a conta ${account.id}: ${error.message}`);
          }
        }
        
        this.logger.log(`Geração de estatísticas concluída para o mês ${month}`);
      }
    } catch (error) {
      this.logger.error(`Erro ao gerar estatísticas: ${error.message}`);
      throw error;
    }
  }

  private async generateStatisticsForAccount(account: Account, month: string): Promise<AccountAdvertisementStatistics> {
    this.logger.log(`Gerando estatísticas para a conta ${account.id} no mês ${month}`);
    
    // Verificar se já existem estatísticas para esta conta neste mês
    const existingStatistics = await this.accountAdvertisementStatisticsRepository.findByAccountIdAndMonth(account.id, month);
    if (existingStatistics) {
      this.logger.log(`Estatísticas já existem para a conta ${account.id} no mês ${month}`);
      return existingStatistics;
    }
    
    // Buscar todos os anúncios ativos da conta
    const { data: advertisements } = await this.advertisementRepository.findByAccountIdWithEvents(
      account.id,
      1, // página
      10000, // limite (assumindo que não haverá mais de 10000 anúncios por conta)
      null, // código
      null, // tipo de transação
      null, // tipo de propriedade
      null, // externalId
      null, // status
    );
    
    if (!advertisements || advertisements.length === 0) {
      this.logger.log(`Nenhum anúncio encontrado para a conta ${account.id}`);
      // Criar estatísticas vazias
      return this.createEmptyStatistics(account.id, month);
    }
    
    // Calcular métricas
    const metrics = this.calculateMetrics(advertisements);
    
    // Criar entidade de estatísticas
    const statistics = new AccountAdvertisementStatistics({
      accountId: account.id,
      month,
      createdAt: new Date(),
      totalAdvertisements: metrics.totalAdvertisements,
      totalVisits: metrics.totalVisits,
      phoneClicks: metrics.phoneClicks,
      digitalCatalogViews: metrics.digitalCatalogViews,
      contactInfoClicks: metrics.contactInfoClicks,
      topViewedAdvertisements: metrics.topViewedAdvertisements,
      topInteractedAdvertisements: metrics.topInteractedAdvertisements,
    });
    
    // Salvar estatísticas
    return this.accountAdvertisementStatisticsRepository.create(statistics);
  }

  private calculateMetrics(advertisements: Advertisement[]): {
    totalAdvertisements: TotalAdvertisements;
    totalVisits: TotalVisits;
    phoneClicks: PhoneClicks;
    digitalCatalogViews: number;
    contactInfoClicks: ContactInfoClicks;
    topViewedAdvertisements: TopAdvertisements;
    topInteractedAdvertisements: TopAdvertisements;
  } {
    // Inicializar contadores
    const totalByTransactionType = {
      sale: 0,
      rent: 0,
    };
    
    const totalByPropertyTypeAndTransaction = {
      house: { sale: 0, rent: 0 },
      apartment: { sale: 0, rent: 0 },
      lot: { sale: 0, rent: 0 },
    };
    
    const visitsByTransactionType = {
      sale: 0,
      rent: 0,
    };
    
    const visitsByPropertyTypeAndTransaction = {
      house: { sale: 0, rent: 0 },
      apartment: { sale: 0, rent: 0 },
      lot: { sale: 0, rent: 0 },
    };
    
    const phoneClicksByTransactionType = {
      sale: 0,
      rent: 0,
    };
    
    const phoneClicksByPropertyTypeAndTransaction = {
      house: { sale: 0, rent: 0 },
      apartment: { sale: 0, rent: 0 },
      lot: { sale: 0, rent: 0 },
    };
    
    const contactInfoClicksByTransactionType = {
      sale: 0,
      rent: 0,
    };
    
    const contactInfoClicksByPropertyTypeAndTransaction = {
      house: { sale: 0, rent: 0 },
      apartment: { sale: 0, rent: 0 },
      lot: { sale: 0, rent: 0 },
    };
    
    let digitalCatalogViews = 0;
    
    // Arrays para armazenar métricas de anúncios para rankings
    const advertisementViewsMap: Map<string, { advertisementId: string, views: number, transactionType: AdvertisementTransactionType }> = new Map();
    const advertisementInteractionsMap: Map<string, { advertisementId: string, interactions: number, transactionType: AdvertisementTransactionType }> = new Map();
    
    // Calcular métricas para cada anúncio
    for (const advertisement of advertisements) {

      // Contar anúncios por tipo de transação e propriedade
      const transactionType = this.mapTransactionType(advertisement.transactionType);
      const propertyType = this.mapPropertyType(advertisement.type);
      
      totalByTransactionType[transactionType]++;
      totalByPropertyTypeAndTransaction[propertyType][transactionType]++;
      
      // Contar visualizações e interações
      let views = 0;
      let phoneClicks = 0;
      let contactInfoClicks = 0;
      
      // Processar eventos de anúncio
      if (advertisement.advertisementEvents && advertisement.advertisementEvents.length > 0) {
        for (const event of advertisement.advertisementEvents) {
          switch (event.type) {
            case 'AD_VIEW':
              views += event.count;
              visitsByTransactionType[transactionType] += event.count;
              visitsByPropertyTypeAndTransaction[propertyType][transactionType] += event.count;
              break;
            case 'AD_PHONE_CLICK':
              phoneClicks += event.count;
              phoneClicksByTransactionType[transactionType] += event.count;
              phoneClicksByPropertyTypeAndTransaction[propertyType][transactionType] += event.count;
              break;
            case 'AD_CONTACT_CLICK':
              contactInfoClicks += event.count;
              contactInfoClicksByTransactionType[transactionType] += event.count;
              contactInfoClicksByPropertyTypeAndTransaction[propertyType][transactionType] += event.count;
              break;
            case 'AD_PROFILE_CLICK':
              digitalCatalogViews += event.count;
              break;
          }
        }
      }
      
      // Armazenar métricas para rankings
      if (views > 0) {
        advertisementViewsMap.set(advertisement.id, {
          advertisementId: advertisement.id,
          views,
          transactionType: advertisement.transactionType,
        });
      }
      
      const interactions = phoneClicks + contactInfoClicks;
      if (interactions > 0) {
        advertisementInteractionsMap.set(advertisement.id, {
          advertisementId: advertisement.id,
          interactions,
          transactionType: advertisement.transactionType,
        });
      }
    }
    
    // Calcular totais
    const totalAdvertisements = advertisements.length;
    const totalVisits = Object.values(visitsByTransactionType).reduce((sum, count) => sum + count, 0);
    const totalPhoneClicks = Object.values(phoneClicksByTransactionType).reduce((sum, count) => sum + count, 0);
    const totalContactInfoClicks = Object.values(contactInfoClicksByTransactionType).reduce((sum, count) => sum + count, 0);
    
    // Criar rankings de anúncios mais visualizados
    const topViewedSale = Array.from(advertisementViewsMap.values())
      .filter(item => item.transactionType === AdvertisementTransactionType.SALE)
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(item => new AdvertisementMetric({
        advertisementId: item.advertisementId,
        views: item.views,
      }));
    
    const topViewedRent = Array.from(advertisementViewsMap.values())
      .filter(item => item.transactionType === AdvertisementTransactionType.RENT)
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(item => new AdvertisementMetric({
        advertisementId: item.advertisementId,
        views: item.views,
      }));
    
    // Criar rankings de anúncios com mais interações
    const topInteractedSale = Array.from(advertisementInteractionsMap.values())
      .filter(item => item.transactionType === AdvertisementTransactionType.SALE)
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 10)
      .map(item => new AdvertisementMetric({
        advertisementId: item.advertisementId,
        interactions: item.interactions,
      }));
    
    const topInteractedRent = Array.from(advertisementInteractionsMap.values())
      .filter(item => item.transactionType === AdvertisementTransactionType.RENT)
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 10)
      .map(item => new AdvertisementMetric({
        advertisementId: item.advertisementId,
        interactions: item.interactions,
      }));
    
    // Criar objetos de métricas
    return {
      totalAdvertisements: new TotalAdvertisements({
        total: totalAdvertisements,
        byTransactionType: new TransactionTypeMetrics(totalByTransactionType),
        byPropertyTypeAndTransaction: new PropertyTypeAndTransactionMetrics(totalByPropertyTypeAndTransaction),
      }),
      totalVisits: new TotalVisits({
        total: totalVisits,
        byTransactionType: new TransactionTypeMetrics(visitsByTransactionType),
        byPropertyTypeAndTransaction: new PropertyTypeAndTransactionMetrics(visitsByPropertyTypeAndTransaction),
      }),
      phoneClicks: new PhoneClicks({
        total: totalPhoneClicks,
        byTransactionType: new TransactionTypeMetrics(phoneClicksByTransactionType),
        byPropertyTypeAndTransaction: new PropertyTypeAndTransactionMetrics(phoneClicksByPropertyTypeAndTransaction),
      }),
      digitalCatalogViews,
      contactInfoClicks: new ContactInfoClicks({
        total: totalContactInfoClicks,
        byTransactionType: new TransactionTypeMetrics(contactInfoClicksByTransactionType),
        byPropertyTypeAndTransaction: new PropertyTypeAndTransactionMetrics(contactInfoClicksByPropertyTypeAndTransaction),
      }),
      topViewedAdvertisements: new TopAdvertisements({
        sale: topViewedSale,
        rent: topViewedRent,
      }),
      topInteractedAdvertisements: new TopAdvertisements({
        sale: topInteractedSale,
        rent: topInteractedRent,
      }),
    };
  }

  private createEmptyStatistics(accountId: string, month: string): Promise<AccountAdvertisementStatistics> {
    const emptyMetricBase = {
      total: 0,
      byTransactionType: { sale: 0, rent: 0 },
      byPropertyTypeAndTransaction: {
        house: { sale: 0, rent: 0 },
        apartment: { sale: 0, rent: 0 },
        lot: { sale: 0, rent: 0 },
      },
    };
    
    const statistics = new AccountAdvertisementStatistics({
      accountId,
      month,
      createdAt: new Date(),
      totalAdvertisements: new TotalAdvertisements(emptyMetricBase),
      totalVisits: new TotalVisits(emptyMetricBase),
      phoneClicks: new PhoneClicks(emptyMetricBase),
      digitalCatalogViews: 0,
      contactInfoClicks: new ContactInfoClicks(emptyMetricBase),
      topViewedAdvertisements: new TopAdvertisements({
        sale: [],
        rent: [],
      }),
      topInteractedAdvertisements: new TopAdvertisements({
        sale: [],
        rent: [],
      }),
    });
    
    return this.accountAdvertisementStatisticsRepository.create(statistics);
  }

  private getPreviousMonth(): string {
    const date = new Date();
    // Subtrair um mês da data atual
    date.setMonth(date.getMonth() - 1);
    // Formatar como YYYY-MM
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private mapPropertyType(type: AdvertisementType): 'house' | 'apartment' | 'lot' {
    switch (type) {
      case AdvertisementType.HOUSE:
        return 'house';
      case AdvertisementType.APARTMENT:
        return 'apartment';
      case AdvertisementType.LOT:
        return 'lot';
      default:
        // Para outros tipos, categorizar como 'house' por padrão
        return 'house';
    }
  }

  private mapTransactionType(type: AdvertisementTransactionType): 'sale' | 'rent' {
    switch (type) {
      case AdvertisementTransactionType.SALE:
        return 'sale';
      case AdvertisementTransactionType.RENT:
        return 'rent';
      default:
        // Caso improvável, mas necessário para o TypeScript
        return 'sale';
    }
  }
}
