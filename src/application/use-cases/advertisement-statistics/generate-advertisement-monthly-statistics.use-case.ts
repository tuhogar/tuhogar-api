import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { IAdvertisementStatisticsRepository } from 'src/application/interfaces/repositories/advertisement-statistics.repository.interface';
import { AdvertisementStatistics } from 'src/domain/entities/advertisement-statistics';
import { Advertisement, AdvertisementTransactionType, AdvertisementType } from 'src/domain/entities/advertisement';
import { 
  AdvertisementMetric, 
  ContactInfoClicks, 
  PhoneClicks, 
  TopAdvertisements, 
  TotalAdvertisements, 
  TotalVisits, 
  TransactionTypeMetrics,
  PropertyTypeAndTransactionMetrics
} from 'src/domain/entities/account-advertisement-statistics';

interface GenerateAdvertisementMonthlyStatisticsUseCaseCommand {
  month?: string; // Formato: "YYYY-MM", se não fornecido, usa o mês anterior ao atual
}

@Injectable()
export class GenerateAdvertisementMonthlyStatisticsUseCase {
  private readonly logger = new Logger(GenerateAdvertisementMonthlyStatisticsUseCase.name);

  constructor(
    private readonly advertisementRepository: IAdvertisementRepository,
    private readonly advertisementStatisticsRepository: IAdvertisementStatisticsRepository,
  ) {}

  /**
   * Executa a geração de estatísticas mensais consolidadas automaticamente
   * no primeiro dia de cada mês às 00:30 (30 minutos após a geração das estatísticas por conta)
   */
  @Cron('30 0 1 * *', {
    name: 'generate-advertisement-monthly-statistics'
  })
  async executeScheduled(): Promise<void> {
    try {
      this.logger.log('Iniciando geração automática de estatísticas mensais consolidadas');
      await this.execute();
      this.logger.log('Geração automática de estatísticas mensais consolidadas concluída com sucesso');
    } catch (error) {
      this.logger.error(`Erro na geração automática de estatísticas mensais consolidadas: ${error.message}`);
      // Não propagar o erro para não interromper outros jobs agendados
    }
  }

  async execute(command?: GenerateAdvertisementMonthlyStatisticsUseCaseCommand): Promise<void> {
    const { month = this.getPreviousMonth() } = command || {};
    
    try {
      this.logger.log(`Gerando estatísticas consolidadas para o mês ${month}`);
      
      // Verificar se já existem estatísticas para este mês
      const existingStatistics = await this.advertisementStatisticsRepository.findByMonth(month);
      if (existingStatistics) {
        this.logger.log(`Estatísticas consolidadas já existem para o mês ${month}`);
        return;
      }
      
      // Buscar todos os anúncios ativos com seus eventos
      const { data: advertisements } = await this.advertisementRepository.findAllWithEvents(
        1, // página
        100000, // limite (assumindo que não haverá mais de 100000 anúncios no total)
        null, // código
        null, // tipo de transação
        null, // tipo de propriedade
        null, // externalId
        null, // status
      );
      
      if (!advertisements || advertisements.length === 0) {
        this.logger.log(`Nenhum anúncio encontrado para o mês ${month}`);
        // Criar estatísticas vazias
        return this.createEmptyStatistics(month);
      }
      
      // Calcular métricas acumulativas
      const currentMetrics = this.calculateMetrics(advertisements);
      
      // Buscar o último registro acumulado disponível
      const lastAccumulatedStats = await this.advertisementStatisticsRepository.findLastAccumulated();
      
      // Se não há estatísticas acumuladas anteriores, usar métricas acumulativas como valores iniciais
      if (!lastAccumulatedStats) {
        this.logger.log(`Não há estatísticas acumuladas anteriores. Usando valores acumulativos atuais como base.`);
        
        // Criar entidade de estatísticas com valores acumulativos
        const statistics = new AdvertisementStatistics({
          month,
          createdAt: new Date(),
          totalAdvertisements: currentMetrics.totalAdvertisements,
          totalVisits: currentMetrics.totalVisits,
          phoneClicks: currentMetrics.phoneClicks,
          digitalCatalogViews: currentMetrics.digitalCatalogViews,
          contactInfoClicks: currentMetrics.contactInfoClicks,
          topViewedAdvertisements: currentMetrics.topViewedAdvertisements,
          topInteractedAdvertisements: currentMetrics.topInteractedAdvertisements,
          // Armazenar métricas acumuladas para uso futuro
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
        await this.advertisementStatisticsRepository.create(statistics);
        return;
      }
      
      // Calcular métricas diferenciais usando o último registro acumulado
      this.logger.log(`Calculando valores diferenciais usando o último registro acumulado (${lastAccumulatedStats.month})`);
      
      // Criar entidade de estatísticas com valores diferenciais
      const statistics = new AdvertisementStatistics({
        month,
        createdAt: new Date(),
        
        /**
         * IMPORTANTE: totalAdvertisements sempre deve ser acumulativo, não diferencial.
         * Isso porque representa o número total de anúncios ativos no período,
         * não um valor incremental como as métricas de interação.
         * 
         * Todas as outras métricas (visualizações, cliques, etc.) são calculadas
         * diferencialmente, subtraindo os valores acumulados anteriores para mostrar
         * apenas a atividade específica do mês atual.
         */
        totalAdvertisements: currentMetrics.totalAdvertisements,
        
        // Calcular métricas diferenciais usando valores acumulados detalhados
        totalVisits: this.calculateDifferentialMetricBaseFromAccumulatedDetailed(
          currentMetrics.totalVisits,
          lastAccumulatedStats.accumulatedMetrics.totalVisits
        ),
        
        phoneClicks: this.calculateDifferentialMetricBaseFromAccumulatedDetailed(
          currentMetrics.phoneClicks,
          lastAccumulatedStats.accumulatedMetrics.phoneClicks
        ),
        
        digitalCatalogViews: Math.max(0, currentMetrics.digitalCatalogViews - lastAccumulatedStats.accumulatedMetrics.digitalCatalogViews),
        
        contactInfoClicks: this.calculateDifferentialMetricBaseFromAccumulatedDetailed(
          currentMetrics.contactInfoClicks,
          lastAccumulatedStats.accumulatedMetrics.contactInfoClicks
        ),
        
        // Calcular topViewedAdvertisements diferencial
        topViewedAdvertisements: this.calculateDifferentialTopAdvertisements(
          currentMetrics.topViewedAdvertisements,
          lastAccumulatedStats.topViewedAdvertisements
        ),
        
        // Calcular topInteractedAdvertisements diferencial
        topInteractedAdvertisements: this.calculateDifferentialTopAdvertisements(
          currentMetrics.topInteractedAdvertisements,
          lastAccumulatedStats.topInteractedAdvertisements
        ),
        
        // Armazenar métricas acumuladas atuais para uso futuro
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
      await this.advertisementStatisticsRepository.create(statistics);
      
    } catch (error) {
      this.logger.error(`Erro ao gerar estatísticas consolidadas: ${error.message}`);
      throw error;
    }
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

  private async createEmptyStatistics(month: string): Promise<void> {
    const emptyMetricBase = {
      total: 0,
      byTransactionType: { sale: 0, rent: 0 },
      byPropertyTypeAndTransaction: {
        house: { sale: 0, rent: 0 },
        apartment: { sale: 0, rent: 0 },
        lot: { sale: 0, rent: 0 },
      },
    };
    
    const statistics = new AdvertisementStatistics({
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
      // Inicializar accumulatedMetrics com valores zerados
      accumulatedMetrics: {
        totalVisits: {
          total: 0,
          byTransactionType: {
            sale: 0,
            rent: 0
          },
          byPropertyTypeAndTransaction: {
            house: {
              sale: 0,
              rent: 0
            },
            apartment: {
              sale: 0,
              rent: 0
            },
            lot: {
              sale: 0,
              rent: 0
            }
          }
        },
        phoneClicks: {
          total: 0,
          byTransactionType: {
            sale: 0,
            rent: 0
          },
          byPropertyTypeAndTransaction: {
            house: {
              sale: 0,
              rent: 0
            },
            apartment: {
              sale: 0,
              rent: 0
            },
            lot: {
              sale: 0,
              rent: 0
            }
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
            house: {
              sale: 0,
              rent: 0
            },
            apartment: {
              sale: 0,
              rent: 0
            },
            lot: {
              sale: 0,
              rent: 0
            }
          }
        }
      }
    });
    
    await this.advertisementStatisticsRepository.create(statistics);
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
        return 'house'; // Valor padrão
    }
  }

  private mapTransactionType(type: AdvertisementTransactionType): 'sale' | 'rent' {
    switch (type) {
      case AdvertisementTransactionType.SALE:
        return 'sale';
      case AdvertisementTransactionType.RENT:
        return 'rent';
      default:
        return 'sale'; // Valor padrão
    }
  }

  // Calcula o mês anterior a partir de um mês específico no formato YYYY-MM
  private getPreviousMonthFromDate(month: string): string {
    const [year, monthStr] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthStr) - 1, 1);
    
    // Subtrair um mês da data
    date.setMonth(date.getMonth() - 1);
    
    // Formatar como YYYY-MM
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  // Calcula métricas diferenciais de base (total, byTransactionType, byPropertyTypeAndTransaction)
  // subtraindo os valores do mês anterior dos valores atuais
  private calculateDifferentialMetricBase<T extends {
    total: number;
    byTransactionType: { sale: number; rent: number };
    byPropertyTypeAndTransaction: {
      house: { sale: number; rent: number };
      apartment: { sale: number; rent: number };
      lot: { sale: number; rent: number };
    };
  }>(
    current: T,
    previous: T
  ): T {
    // Calcular total diferencial
    const total = Math.max(0, current.total - previous.total);
    
    // Calcular byTransactionType diferencial
    const byTransactionType = {
      sale: Math.max(0, current.byTransactionType.sale - previous.byTransactionType.sale),
      rent: Math.max(0, current.byTransactionType.rent - previous.byTransactionType.rent),
    };
    
    // Calcular byPropertyTypeAndTransaction diferencial
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
    
    // Criar nova instância do tipo T com valores diferenciais
    return {
      ...current,
      total,
      byTransactionType,
      byPropertyTypeAndTransaction,
    };
  }

  /**
   * Calcula métricas diferenciais de base (total, byTransactionType, byPropertyTypeAndTransaction)
   * subtraindo os valores acumulados detalhados dos valores atuais
   * @param current Valores atuais
   * @param accumulated Valores acumulados detalhados
   * @returns Métricas diferenciais
   */
  private calculateDifferentialMetricBaseFromAccumulatedDetailed<T extends {
    total: number;
    byTransactionType: { sale: number; rent: number };
    byPropertyTypeAndTransaction: {
      house: { sale: number; rent: number };
      apartment: { sale: number; rent: number };
      lot: { sale: number; rent: number };
    };
  }>(
    current: T,
    accumulated: {
      total: number;
      byTransactionType: { sale: number; rent: number };
      byPropertyTypeAndTransaction: {
        house: { sale: number; rent: number };
        apartment: { sale: number; rent: number };
        lot: { sale: number; rent: number };
      };
    }
  ): T {
    // Calcular total diferencial
    const total = Math.max(0, current.total - accumulated.total);
    
    // Calcular byTransactionType diferencial
    const byTransactionType = {
      sale: Math.max(0, current.byTransactionType.sale - accumulated.byTransactionType.sale),
      rent: Math.max(0, current.byTransactionType.rent - accumulated.byTransactionType.rent),
    };
    
    // Calcular byPropertyTypeAndTransaction diferencial
    const byPropertyTypeAndTransaction = {
      house: {
        sale: Math.max(0, current.byPropertyTypeAndTransaction.house.sale - accumulated.byPropertyTypeAndTransaction.house.sale),
        rent: Math.max(0, current.byPropertyTypeAndTransaction.house.rent - accumulated.byPropertyTypeAndTransaction.house.rent),
      },
      apartment: {
        sale: Math.max(0, current.byPropertyTypeAndTransaction.apartment.sale - accumulated.byPropertyTypeAndTransaction.apartment.sale),
        rent: Math.max(0, current.byPropertyTypeAndTransaction.apartment.rent - accumulated.byPropertyTypeAndTransaction.apartment.rent),
      },
      lot: {
        sale: Math.max(0, current.byPropertyTypeAndTransaction.lot.sale - accumulated.byPropertyTypeAndTransaction.lot.sale),
        rent: Math.max(0, current.byPropertyTypeAndTransaction.lot.rent - accumulated.byPropertyTypeAndTransaction.lot.rent),
      },
    };
    
    // Criar nova instância do tipo T com valores diferenciais
    return {
      ...current,
      total,
      byTransactionType,
      byPropertyTypeAndTransaction,
    };
  }

  /**
   * Calcula rankings diferenciais subtraindo os valores do mês anterior
   * e reordenando com base nos valores diferenciais
   * @param current Valores atuais
   * @param previous Valores do mês anterior
   * @returns Rankings diferenciais
   */
  private calculateDifferentialTopAdvertisements(
    current: TopAdvertisements,
    previous: TopAdvertisements
  ): TopAdvertisements {
    // Função para calcular valores diferenciais para um tipo de transação
    const calculateDifferential = (
      currentItems: AdvertisementMetric[],
      previousItems: AdvertisementMetric[]
    ) => {
      // Mapear itens atuais para um objeto com valores diferenciais
      const differentialMap = new Map<string, AdvertisementMetric>();
      
      // Processar itens atuais
      currentItems.forEach(item => {
        const prevItem = previousItems.find(p => p.advertisementId === item.advertisementId);
        
        // Se o item existe no mês anterior, calcular diferencial
        if (prevItem) {
          const viewsDiff = item.views ? Math.max(0, item.views - (prevItem.views || 0)) : undefined;
          const interactionsDiff = item.interactions ? Math.max(0, item.interactions - (prevItem.interactions || 0)) : undefined;
          
          differentialMap.set(item.advertisementId, new AdvertisementMetric({
            advertisementId: item.advertisementId,
            views: viewsDiff,
            interactions: interactionsDiff,
          }));
        } else {
          // Se o item não existe no mês anterior, usar valores atuais
          differentialMap.set(item.advertisementId, item);
        }
      });
      
      // Ordenar por views ou interactions (dependendo de qual está definido)
      const sortedItems = Array.from(differentialMap.values()).sort((a, b) => {
        if (a.views !== undefined && b.views !== undefined) {
          return b.views - a.views;
        }
        if (a.interactions !== undefined && b.interactions !== undefined) {
          return b.interactions - a.interactions;
        }
        return 0;
      });
      
      // Retornar os top 10
      return sortedItems.slice(0, 10);
    };
    
    // Calcular diferenciais para venda e aluguel
    const saleDifferential = calculateDifferential(current.sale, previous.sale);
    const rentDifferential = calculateDifferential(current.rent, previous.rent);
    
    // Retornar novo objeto TopAdvertisements com valores diferenciais
    return new TopAdvertisements({
      sale: saleDifferential,
      rent: rentDifferential,
    });
  }
}
