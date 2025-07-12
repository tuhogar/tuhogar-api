import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { IAccountAdvertisementStatisticsRepository } from 'src/application/interfaces/repositories/account-advertisement-statistics.repository.interface';
import { AccountAdvertisementStatistics, AdvertisementMetric, ContactInfoClicks, MetricBase, PhoneClicks, PropertyTypeAndTransactionMetrics, TopAdvertisements, TotalAdvertisements, TotalVisits, TransactionTypeMetrics } from 'src/domain/entities/account-advertisement-statistics';
import { Advertisement, AdvertisementTransactionType, AdvertisementType } from 'src/domain/entities/advertisement';
import { Account } from 'src/domain/entities/account';

interface GenerateAccountAdvertisementMonthlyStatisticsUseCaseCommand {
  month?: string; // Formato: "YYYY-MM", se não fornecido, usa o mês anterior ao atual
  accountId?: string; // Se fornecido, gera estatísticas apenas para esta conta
}

@Injectable()
export class GenerateAccountAdvertisementMonthlyStatisticsUseCase {
  private readonly logger = new Logger(GenerateAccountAdvertisementMonthlyStatisticsUseCase.name);

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
    name: 'generate-account-advertisement-monthly-statistics'
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

  async execute(command?: GenerateAccountAdvertisementMonthlyStatisticsUseCaseCommand): Promise<void> {
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
    
    // Calcular métricas acumulativas
    const currentMetrics = this.calculateMetrics(advertisements);
    
    // Buscar o último registro acumulado (pode ser do mês anterior ou de qualquer mês anterior)
    const lastAccumulatedStats = await this.accountAdvertisementStatisticsRepository.findLastAccumulatedByAccountId(account.id);
    
    // Se não há estatísticas acumuladas anteriores, usar métricas acumulativas atuais
    if (!lastAccumulatedStats) {
      this.logger.log(`Não há estatísticas acumuladas anteriores para a conta ${account.id}. Usando valores acumulativos atuais.`);
      
      // Criar entidade de estatísticas com valores acumulativos
      const statistics = new AccountAdvertisementStatistics({
        accountId: account.id,
        month,
        createdAt: new Date(),
        totalAdvertisements: currentMetrics.totalAdvertisements,
        totalVisits: currentMetrics.totalVisits,
        phoneClicks: currentMetrics.phoneClicks,
        digitalCatalogViews: currentMetrics.digitalCatalogViews,
        contactInfoClicks: currentMetrics.contactInfoClicks,
        topViewedAdvertisements: currentMetrics.topViewedAdvertisements,
        topInteractedAdvertisements: currentMetrics.topInteractedAdvertisements,
        // Armazenar os valores acumulados com estrutura completa
        accumulatedMetrics: {
          totalVisits: {
            total: currentMetrics.totalVisits.total,
            byTransactionType: {
              sale: currentMetrics.totalVisits.byTransactionType.sale,
              rent: currentMetrics.totalVisits.byTransactionType.rent
            },
            byPropertyTypeAndTransaction: {
              house: {
                sale: currentMetrics.totalVisits.byPropertyTypeAndTransaction.house.sale,
                rent: currentMetrics.totalVisits.byPropertyTypeAndTransaction.house.rent
              },
              apartment: {
                sale: currentMetrics.totalVisits.byPropertyTypeAndTransaction.apartment.sale,
                rent: currentMetrics.totalVisits.byPropertyTypeAndTransaction.apartment.rent
              },
              lot: {
                sale: currentMetrics.totalVisits.byPropertyTypeAndTransaction.lot.sale,
                rent: currentMetrics.totalVisits.byPropertyTypeAndTransaction.lot.rent
              }
            }
          },
          phoneClicks: {
            total: currentMetrics.phoneClicks.total,
            byTransactionType: {
              sale: currentMetrics.phoneClicks.byTransactionType.sale,
              rent: currentMetrics.phoneClicks.byTransactionType.rent
            },
            byPropertyTypeAndTransaction: {
              house: {
                sale: currentMetrics.phoneClicks.byPropertyTypeAndTransaction.house.sale,
                rent: currentMetrics.phoneClicks.byPropertyTypeAndTransaction.house.rent
              },
              apartment: {
                sale: currentMetrics.phoneClicks.byPropertyTypeAndTransaction.apartment.sale,
                rent: currentMetrics.phoneClicks.byPropertyTypeAndTransaction.apartment.rent
              },
              lot: {
                sale: currentMetrics.phoneClicks.byPropertyTypeAndTransaction.lot.sale,
                rent: currentMetrics.phoneClicks.byPropertyTypeAndTransaction.lot.rent
              }
            }
          },
          digitalCatalogViews: currentMetrics.digitalCatalogViews,
          contactInfoClicks: {
            total: currentMetrics.contactInfoClicks.total,
            byTransactionType: {
              sale: currentMetrics.contactInfoClicks.byTransactionType.sale,
              rent: currentMetrics.contactInfoClicks.byTransactionType.rent
            },
            byPropertyTypeAndTransaction: {
              house: {
                sale: currentMetrics.contactInfoClicks.byPropertyTypeAndTransaction.house.sale,
                rent: currentMetrics.contactInfoClicks.byPropertyTypeAndTransaction.house.rent
              },
              apartment: {
                sale: currentMetrics.contactInfoClicks.byPropertyTypeAndTransaction.apartment.sale,
                rent: currentMetrics.contactInfoClicks.byPropertyTypeAndTransaction.apartment.rent
              },
              lot: {
                sale: currentMetrics.contactInfoClicks.byPropertyTypeAndTransaction.lot.sale,
                rent: currentMetrics.contactInfoClicks.byPropertyTypeAndTransaction.lot.rent
              }
            }
          }
        }
      });
      
      // Salvar estatísticas
      return this.accountAdvertisementStatisticsRepository.create(statistics);
    }
    
    // Calcular métricas diferenciais subtraindo valores acumulados anteriores
    this.logger.log(`Calculando valores diferenciais usando estatísticas acumuladas anteriores`);
    
    // Verificar se o registro acumulado tem o campo accumulatedMetrics
    // Se não tiver, criar um com base nos valores do próprio registro
    const accumulatedMetrics = lastAccumulatedStats.accumulatedMetrics || {
      totalVisits: {
        total: lastAccumulatedStats.totalVisits?.total || 0,
        byTransactionType: {
          sale: lastAccumulatedStats.totalVisits?.byTransactionType?.sale || 0,
          rent: lastAccumulatedStats.totalVisits?.byTransactionType?.rent || 0
        },
        byPropertyTypeAndTransaction: {
          house: {
            sale: lastAccumulatedStats.totalVisits?.byPropertyTypeAndTransaction?.house?.sale || 0,
            rent: lastAccumulatedStats.totalVisits?.byPropertyTypeAndTransaction?.house?.rent || 0
          },
          apartment: {
            sale: lastAccumulatedStats.totalVisits?.byPropertyTypeAndTransaction?.apartment?.sale || 0,
            rent: lastAccumulatedStats.totalVisits?.byPropertyTypeAndTransaction?.apartment?.rent || 0
          },
          lot: {
            sale: lastAccumulatedStats.totalVisits?.byPropertyTypeAndTransaction?.lot?.sale || 0,
            rent: lastAccumulatedStats.totalVisits?.byPropertyTypeAndTransaction?.lot?.rent || 0
          }
        }
      },
      phoneClicks: {
        total: lastAccumulatedStats.phoneClicks?.total || 0,
        byTransactionType: {
          sale: lastAccumulatedStats.phoneClicks?.byTransactionType?.sale || 0,
          rent: lastAccumulatedStats.phoneClicks?.byTransactionType?.rent || 0
        },
        byPropertyTypeAndTransaction: {
          house: {
            sale: lastAccumulatedStats.phoneClicks?.byPropertyTypeAndTransaction?.house?.sale || 0,
            rent: lastAccumulatedStats.phoneClicks?.byPropertyTypeAndTransaction?.house?.rent || 0
          },
          apartment: {
            sale: lastAccumulatedStats.phoneClicks?.byPropertyTypeAndTransaction?.apartment?.sale || 0,
            rent: lastAccumulatedStats.phoneClicks?.byPropertyTypeAndTransaction?.apartment?.rent || 0
          },
          lot: {
            sale: lastAccumulatedStats.phoneClicks?.byPropertyTypeAndTransaction?.lot?.sale || 0,
            rent: lastAccumulatedStats.phoneClicks?.byPropertyTypeAndTransaction?.lot?.rent || 0
          }
        }
      },
      digitalCatalogViews: lastAccumulatedStats.digitalCatalogViews || 0,
      contactInfoClicks: {
        total: lastAccumulatedStats.contactInfoClicks?.total || 0,
        byTransactionType: {
          sale: lastAccumulatedStats.contactInfoClicks?.byTransactionType?.sale || 0,
          rent: lastAccumulatedStats.contactInfoClicks?.byTransactionType?.rent || 0
        },
        byPropertyTypeAndTransaction: {
          house: {
            sale: lastAccumulatedStats.contactInfoClicks?.byPropertyTypeAndTransaction?.house?.sale || 0,
            rent: lastAccumulatedStats.contactInfoClicks?.byPropertyTypeAndTransaction?.house?.rent || 0
          },
          apartment: {
            sale: lastAccumulatedStats.contactInfoClicks?.byPropertyTypeAndTransaction?.apartment?.sale || 0,
            rent: lastAccumulatedStats.contactInfoClicks?.byPropertyTypeAndTransaction?.apartment?.rent || 0
          },
          lot: {
            sale: lastAccumulatedStats.contactInfoClicks?.byPropertyTypeAndTransaction?.lot?.sale || 0,
            rent: lastAccumulatedStats.contactInfoClicks?.byPropertyTypeAndTransaction?.lot?.rent || 0
          }
        }
      }
    };
    
    // Criar entidade de estatísticas com valores diferenciais
    const statistics = new AccountAdvertisementStatistics({
      accountId: account.id,
      month,
      createdAt: new Date(),
      
      /**
       * IMPORTANTE: totalAdvertisements sempre deve ser acumulativo, não diferencial.
       * Isso porque representa o número total de anúncios ativos no período,
       * não um valor incremental como as métricas de interação.
       */
      totalAdvertisements: currentMetrics.totalAdvertisements,
      
      // Calcular métricas diferenciais usando os valores acumulados
      totalVisits: this.calculateDifferentialMetricBaseFromAccumulatedDetailed(
        currentMetrics.totalVisits,
        accumulatedMetrics.totalVisits
      ),
      
      phoneClicks: this.calculateDifferentialMetricBaseFromAccumulatedDetailed(
        currentMetrics.phoneClicks,
        accumulatedMetrics.phoneClicks
      ),
      
      digitalCatalogViews: Math.max(0, currentMetrics.digitalCatalogViews - accumulatedMetrics.digitalCatalogViews),
      
      contactInfoClicks: this.calculateDifferentialMetricBaseFromAccumulatedDetailed(
        currentMetrics.contactInfoClicks,
        accumulatedMetrics.contactInfoClicks
      ),
      
      // Para os rankings, continuamos usando o método existente
      topViewedAdvertisements: this.calculateDifferentialTopAdvertisements(
        currentMetrics.topViewedAdvertisements,
        lastAccumulatedStats.topViewedAdvertisements
      ),
      
      topInteractedAdvertisements: this.calculateDifferentialTopAdvertisements(
        currentMetrics.topInteractedAdvertisements,
        lastAccumulatedStats.topInteractedAdvertisements
      ),
      
      // Armazenar os valores acumulados atuais com estrutura completa
      accumulatedMetrics: {
        totalVisits: {
          total: currentMetrics.totalVisits.total,
          byTransactionType: {
            sale: currentMetrics.totalVisits.byTransactionType.sale,
            rent: currentMetrics.totalVisits.byTransactionType.rent
          },
          byPropertyTypeAndTransaction: {
            house: {
              sale: currentMetrics.totalVisits.byPropertyTypeAndTransaction.house.sale,
              rent: currentMetrics.totalVisits.byPropertyTypeAndTransaction.house.rent
            },
            apartment: {
              sale: currentMetrics.totalVisits.byPropertyTypeAndTransaction.apartment.sale,
              rent: currentMetrics.totalVisits.byPropertyTypeAndTransaction.apartment.rent
            },
            lot: {
              sale: currentMetrics.totalVisits.byPropertyTypeAndTransaction.lot.sale,
              rent: currentMetrics.totalVisits.byPropertyTypeAndTransaction.lot.rent
            }
          }
        },
        phoneClicks: {
          total: currentMetrics.phoneClicks.total,
          byTransactionType: {
            sale: currentMetrics.phoneClicks.byTransactionType.sale,
            rent: currentMetrics.phoneClicks.byTransactionType.rent
          },
          byPropertyTypeAndTransaction: {
            house: {
              sale: currentMetrics.phoneClicks.byPropertyTypeAndTransaction.house.sale,
              rent: currentMetrics.phoneClicks.byPropertyTypeAndTransaction.house.rent
            },
            apartment: {
              sale: currentMetrics.phoneClicks.byPropertyTypeAndTransaction.apartment.sale,
              rent: currentMetrics.phoneClicks.byPropertyTypeAndTransaction.apartment.rent
            },
            lot: {
              sale: currentMetrics.phoneClicks.byPropertyTypeAndTransaction.lot.sale,
              rent: currentMetrics.phoneClicks.byPropertyTypeAndTransaction.lot.rent
            }
          }
        },
        digitalCatalogViews: currentMetrics.digitalCatalogViews,
        contactInfoClicks: {
          total: currentMetrics.contactInfoClicks.total,
          byTransactionType: {
            sale: currentMetrics.contactInfoClicks.byTransactionType.sale,
            rent: currentMetrics.contactInfoClicks.byTransactionType.rent
          },
          byPropertyTypeAndTransaction: {
            house: {
              sale: currentMetrics.contactInfoClicks.byPropertyTypeAndTransaction.house.sale,
              rent: currentMetrics.contactInfoClicks.byPropertyTypeAndTransaction.house.rent
            },
            apartment: {
              sale: currentMetrics.contactInfoClicks.byPropertyTypeAndTransaction.apartment.sale,
              rent: currentMetrics.contactInfoClicks.byPropertyTypeAndTransaction.apartment.rent
            },
            lot: {
              sale: currentMetrics.contactInfoClicks.byPropertyTypeAndTransaction.lot.sale,
              rent: currentMetrics.contactInfoClicks.byPropertyTypeAndTransaction.lot.rent
            }
          }
        }
      }
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
            case 'AD_PROFILE_VIEW':
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
      // Adicionar valores acumulados vazios com estrutura completa
      accumulatedMetrics: {
        totalVisits: {
          total: 0,
          byTransactionType: {
            sale: 0,
            rent: 0
          },
          byPropertyTypeAndTransaction: {
            house: { sale: 0, rent: 0 },
            apartment: { sale: 0, rent: 0 },
            lot: { sale: 0, rent: 0 }
          }
        },
        phoneClicks: {
          total: 0,
          byTransactionType: {
            sale: 0,
            rent: 0
          },
          byPropertyTypeAndTransaction: {
            house: { sale: 0, rent: 0 },
            apartment: { sale: 0, rent: 0 },
            lot: { sale: 0, rent: 0 }
          }
        },
        digitalCatalogViews: 0,
        contactInfoClicks: {
          total: 0,
          byTransactionType: {
            sale: 0,
            rent: 0
          },
          byPropertyTypeAndTransaction: {
            house: { sale: 0, rent: 0 },
            apartment: { sale: 0, rent: 0 },
            lot: { sale: 0, rent: 0 }
          }
        }
      }
    });
    
    return this.accountAdvertisementStatisticsRepository.create(statistics);
  }

  private getPreviousMonth(): string {
    const date = new Date(Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate(),
      new Date().getUTCHours(),
      new Date().getUTCMinutes(),
      new Date().getUTCSeconds(),
      new Date().getUTCMilliseconds()
  ));
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

  /**
   * Calcula o mês anterior a partir de um mês específico no formato YYYY-MM
   */
  private getPreviousMonthFromDate(month: string): string {
    const [year, monthStr] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthStr) - 1, 1);
    
    // Subtrair um mês da data
    date.setMonth(date.getMonth() - 1);
    
    // Formatar como YYYY-MM
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Calcula métricas diferenciais de base (total, byTransactionType, byPropertyTypeAndTransaction)
   * subtraindo os valores do mês anterior dos valores atuais
   */
  private calculateDifferentialMetricBase<T extends MetricBase>(
    current: T,
    previous: T
  ): T {
    // Criar uma nova instância do mesmo tipo
    const Constructor = current.constructor as new (props: MetricBase) => T;
    
    // Calcular total diferencial (nunca negativo)
    const total = Math.max(0, current.total - previous.total);
    
    // Calcular valores diferenciais por tipo de transação
    const byTransactionType = {
      sale: Math.max(0, current.byTransactionType.sale - previous.byTransactionType.sale),
      rent: Math.max(0, current.byTransactionType.rent - previous.byTransactionType.rent),
    };
    
    // Calcular valores diferenciais por tipo de propriedade e transação
    const byPropertyTypeAndTransaction = {
      house: {
        sale: Math.max(0, current.byPropertyTypeAndTransaction.house.sale - previous.byPropertyTypeAndTransaction.house.sale),
        rent: Math.max(0, current.byPropertyTypeAndTransaction.house.rent - previous.byPropertyTypeAndTransaction.house.rent),
      },
      apartment: {
        sale: Math.max(0, current.byPropertyTypeAndTransaction.apartment.sale - previous.byPropertyTypeAndTransaction.apartment.sale),
        rent: Math.max(0, current.byPropertyTypeAndTransaction.apartment.rent - previous.byPropertyTypeAndTransaction.apartment.rent),
      },
      lot: {
        sale: Math.max(0, current.byPropertyTypeAndTransaction.lot.sale - previous.byPropertyTypeAndTransaction.lot.sale),
        rent: Math.max(0, current.byPropertyTypeAndTransaction.lot.rent - previous.byPropertyTypeAndTransaction.lot.rent),
      },
    };
    
    // Criar nova instância da métrica com valores diferenciais
    return new Constructor({
      total,
      byTransactionType: new TransactionTypeMetrics(byTransactionType),
      byPropertyTypeAndTransaction: new PropertyTypeAndTransactionMetrics(byPropertyTypeAndTransaction),
    });
  }

  /**
   * Calcula rankings diferenciais subtraindo os valores do mês anterior
   * e reordenando com base nos valores diferenciais
   */
  /**
   * Calcula métricas diferenciais de base (total, byTransactionType, byPropertyTypeAndTransaction)
   * subtraindo os valores acumulados anteriores dos valores atuais
   * Esta versão usa um valor acumulado único em vez de um objeto MetricBase completo
   */
  private calculateDifferentialMetricBaseFromAccumulated<T extends MetricBase>(
    current: T,
    previousAccumulatedTotal: number
  ): T {
    // Criar uma nova instância do mesmo tipo
    const Constructor = current.constructor as new (props: MetricBase) => T;
    
    // Calcular total diferencial (nunca negativo)
    const total = Math.max(0, current.total - previousAccumulatedTotal);
    
    // Como não temos os valores detalhados por tipo de transação e propriedade no acumulado,
    // vamos distribuir o total proporcionalmente com base nos valores atuais
    const ratio = current.total > 0 ? total / current.total : 0;
    
    // Calcular valores diferenciais por tipo de transação
    const byTransactionType = {
      sale: Math.round(current.byTransactionType.sale * ratio),
      rent: Math.round(current.byTransactionType.rent * ratio),
    };
    
    // Calcular valores diferenciais por tipo de propriedade e transação
    const byPropertyTypeAndTransaction = {
      house: {
        sale: Math.round(current.byPropertyTypeAndTransaction.house.sale * ratio),
        rent: Math.round(current.byPropertyTypeAndTransaction.house.rent * ratio),
      },
      apartment: {
        sale: Math.round(current.byPropertyTypeAndTransaction.apartment.sale * ratio),
        rent: Math.round(current.byPropertyTypeAndTransaction.apartment.rent * ratio),
      },
      lot: {
        sale: Math.round(current.byPropertyTypeAndTransaction.lot.sale * ratio),
        rent: Math.round(current.byPropertyTypeAndTransaction.lot.rent * ratio),
      },
    };
    
    // Criar nova instância da métrica com valores diferenciais
    return new Constructor({
      total,
      byTransactionType: new TransactionTypeMetrics(byTransactionType),
      byPropertyTypeAndTransaction: new PropertyTypeAndTransactionMetrics(byPropertyTypeAndTransaction),
    });
  }

  /**
   * Calcula métricas diferenciais de base usando a estrutura detalhada de métricas acumuladas
   * Esta versão usa os valores detalhados por tipo de transação e propriedade
   */
  private calculateDifferentialMetricBaseFromAccumulatedDetailed<T extends MetricBase>(
    current: T,
    previousAccumulated: {
      total: number;
      byTransactionType: {
        sale: number;
        rent: number;
      };
      byPropertyTypeAndTransaction: {
        house: { sale: number; rent: number };
        apartment: { sale: number; rent: number };
        lot: { sale: number; rent: number };
      };
    }
  ): T {
    // Criar uma nova instância do mesmo tipo
    const Constructor = current.constructor as new (props: MetricBase) => T;
    
    // Calcular total diferencial (nunca negativo)
    const total = Math.max(0, current.total - previousAccumulated.total);
    
    // Calcular valores diferenciais por tipo de transação
    const byTransactionType = {
      sale: Math.max(0, current.byTransactionType.sale - previousAccumulated.byTransactionType.sale),
      rent: Math.max(0, current.byTransactionType.rent - previousAccumulated.byTransactionType.rent),
    };
    
    // Calcular valores diferenciais por tipo de propriedade e transação
    const byPropertyTypeAndTransaction = {
      house: {
        sale: Math.max(0, current.byPropertyTypeAndTransaction.house.sale - previousAccumulated.byPropertyTypeAndTransaction.house.sale),
        rent: Math.max(0, current.byPropertyTypeAndTransaction.house.rent - previousAccumulated.byPropertyTypeAndTransaction.house.rent),
      },
      apartment: {
        sale: Math.max(0, current.byPropertyTypeAndTransaction.apartment.sale - previousAccumulated.byPropertyTypeAndTransaction.apartment.sale),
        rent: Math.max(0, current.byPropertyTypeAndTransaction.apartment.rent - previousAccumulated.byPropertyTypeAndTransaction.apartment.rent),
      },
      lot: {
        sale: Math.max(0, current.byPropertyTypeAndTransaction.lot.sale - previousAccumulated.byPropertyTypeAndTransaction.lot.sale),
        rent: Math.max(0, current.byPropertyTypeAndTransaction.lot.rent - previousAccumulated.byPropertyTypeAndTransaction.lot.rent),
      },
    };
    
    // Criar nova instância da métrica com valores diferenciais
    return new Constructor({
      total,
      byTransactionType: new TransactionTypeMetrics(byTransactionType),
      byPropertyTypeAndTransaction: new PropertyTypeAndTransactionMetrics(byPropertyTypeAndTransaction),
    });
  }

  private calculateDifferentialTopAdvertisements(
    current: TopAdvertisements,
    previous: TopAdvertisements
  ): TopAdvertisements {
    // Mapear anúncios do mês anterior para facilitar a busca
    const prevSaleMap = new Map<string, AdvertisementMetric>();
    const prevRentMap = new Map<string, AdvertisementMetric>();
    
    // Preencher os mapas com dados do mês anterior
    previous.sale.forEach(item => {
      prevSaleMap.set(item.advertisementId, item);
    });
    
    previous.rent.forEach(item => {
      prevRentMap.set(item.advertisementId, item);
    });
    
    // Calcular valores diferenciais para anúncios de venda
    const saleDifferential = current.sale.map(item => {
      const prevItem = prevSaleMap.get(item.advertisementId);
      
      // Se não há item anterior ou não tem views/interactions, usar valores atuais
      if (!prevItem) {
        return new AdvertisementMetric({
          advertisementId: item.advertisementId,
          views: item.views,
          interactions: item.interactions,
        });
      }
      
      // Calcular valores diferenciais
      const views = item.views !== undefined && prevItem.views !== undefined
        ? Math.max(0, item.views - prevItem.views)
        : item.views;
        
      const interactions = item.interactions !== undefined && prevItem.interactions !== undefined
        ? Math.max(0, item.interactions - prevItem.interactions)
        : item.interactions;
      
      return new AdvertisementMetric({
        advertisementId: item.advertisementId,
        views,
        interactions,
      });
    });
    
    // Calcular valores diferenciais para anúncios de aluguel (mesmo processo)
    const rentDifferential = current.rent.map(item => {
      const prevItem = prevRentMap.get(item.advertisementId);
      
      if (!prevItem) {
        return new AdvertisementMetric({
          advertisementId: item.advertisementId,
          views: item.views,
          interactions: item.interactions,
        });
      }
      
      const views = item.views !== undefined && prevItem.views !== undefined
        ? Math.max(0, item.views - prevItem.views)
        : item.views;
        
      const interactions = item.interactions !== undefined && prevItem.interactions !== undefined
        ? Math.max(0, item.interactions - prevItem.interactions)
        : item.interactions;
      
      return new AdvertisementMetric({
        advertisementId: item.advertisementId,
        views,
        interactions,
      });
    });
    
    // Reordenar os rankings com base nos valores diferenciais
    const sortedSale = saleDifferential
      .filter(item => (item.views || 0) > 0 || (item.interactions || 0) > 0) // Remover itens sem atividade
      .sort((a, b) => {
        // Ordenar por views se disponível, caso contrário por interactions
        if (a.views !== undefined && b.views !== undefined) {
          return b.views - a.views;
        }
        return (b.interactions || 0) - (a.interactions || 0);
      })
      .slice(0, 10); // Manter apenas os top 10
    
    const sortedRent = rentDifferential
      .filter(item => (item.views || 0) > 0 || (item.interactions || 0) > 0)
      .sort((a, b) => {
        if (a.views !== undefined && b.views !== undefined) {
          return b.views - a.views;
        }
        return (b.interactions || 0) - (a.interactions || 0);
      })
      .slice(0, 10);
    
    // Criar nova instância de TopAdvertisements com valores diferenciais
    return new TopAdvertisements({
      sale: sortedSale,
      rent: sortedRent,
    });
  }
}
