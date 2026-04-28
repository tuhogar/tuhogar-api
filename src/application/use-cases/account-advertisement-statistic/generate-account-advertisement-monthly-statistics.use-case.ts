import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { IAccountAdvertisementStatisticsRepository } from 'src/application/interfaces/repositories/account-advertisement-statistics.repository.interface';
import {
  AccountAdvertisementStatistics,
  AccumulatedDashboard,
  AdvertisementMetric,
  ContactInfoClicks,
  DashboardBreakdownItem,
  DashboardBreakdowns,
  DashboardData,
  DashboardMetricBreakdowns,
  DashboardMetricByOfferItem,
  DashboardMetricItem,
  DashboardPropertyTypeByOfferItem,
  DashboardSummary,
  MetricBase,
  PhoneClicks,
  PropertyTypeAndTransactionMetrics,
  TopAdvertisements,
  TotalAdvertisements,
  TotalVisits,
  TransactionTypeMetrics,
} from 'src/domain/entities/account-advertisement-statistics';
import {
  Advertisement,
  AdvertisementStatus,
  AdvertisementTransactionType,
  AdvertisementType,
} from 'src/domain/entities/advertisement';
import { Account } from 'src/domain/entities/account';

interface GenerateAccountAdvertisementMonthlyStatisticsUseCaseCommand {
  month?: string; // Formato: "YYYY-MM", se não fornecido, usa o mês anterior ao atual
  accountId?: string; // Se fornecido, gera estatísticas apenas para esta conta
}

type PropertyTypeKey =
  | 'house'
  | 'apartment'
  | 'lot'
  | 'building'
  | 'warehouse'
  | 'office'
  | 'commercial';

const PROPERTY_TYPE_KEYS: PropertyTypeKey[] = [
  'house',
  'apartment',
  'lot',
  'building',
  'warehouse',
  'office',
  'commercial',
];

const PROPERTY_TYPE_UPPER: Record<PropertyTypeKey, string> = {
  house: 'HOUSE',
  apartment: 'APARTMENT',
  lot: 'LOT',
  building: 'BUILDING',
  warehouse: 'WAREHOUSE',
  office: 'OFFICE',
  commercial: 'COMMERCIAL',
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  HOUSE: 'Casa',
  APARTMENT: 'Apartamento',
  LOT: 'Lote',
  BUILDING: 'Edificio',
  WAREHOUSE: 'Bodega',
  OFFICE: 'Oficina',
  COMMERCIAL: 'Local',
};

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  RENT: 'Arriendo',
  SALE: 'Venta',
};

const UNKNOWN_LOCATION_KEY = 'UNKNOWN';
const UNKNOWN_LOCATION_LABEL = 'Sin definir';
const TOP_N_LOCATIONS = 10;

const DASHBOARD_STATUSES: AdvertisementStatus[] = [
  AdvertisementStatus.ACTIVE,
  AdvertisementStatus.WAITING_FOR_APPROVAL,
  AdvertisementStatus.PAUSED_BY_USER,
  AdvertisementStatus.PAUSED_BY_APPLICATION,
];

interface DashboardEventCounts {
  views: number;
  whatsappClicks: number;
  phoneClicks: number;
  catalogViews: number;
}

interface DashboardPropertyCount {
  properties: number;
  activeProperties: number;
}

interface CumulativeDashboardSnapshot {
  summary: {
    totalProperties: number;
    activeProperties: number;
    totalAdViews: number;
    totalAdWhatsappClicks: number;
    totalAdPhoneClicks: number;
    totalAdCatalogViews: number;
  };
  propertyCountsByTransaction: Record<'sale' | 'rent', DashboardPropertyCount>;
  propertyCountsByPropertyType: Record<PropertyTypeKey, DashboardPropertyCount>;
  propertyCountsByPropertyTypeAndTransaction: Record<
    PropertyTypeKey,
    { rent: number; sale: number }
  >;
  eventCountsByTransaction: Record<'sale' | 'rent', DashboardEventCounts>;
  eventCountsByPropertyType: Record<PropertyTypeKey, DashboardEventCounts>;
  eventCountsByPropertyTypeAndTransaction: Record<
    PropertyTypeKey,
    { rent: DashboardEventCounts; sale: DashboardEventCounts }
  >;
  viewsByCityAndTransaction: Record<string, { sale: number; rent: number }>;
  viewsBySectorAndTransaction: Record<string, { sale: number; rent: number }>;
  interactionsByCityAndTransaction: Record<
    string,
    { sale: number; rent: number }
  >;
  interactionsBySectorAndTransaction: Record<
    string,
    { sale: number; rent: number }
  >;
}

@Injectable()
export class GenerateAccountAdvertisementMonthlyStatisticsUseCase {
  private readonly logger = new Logger(
    GenerateAccountAdvertisementMonthlyStatisticsUseCase.name,
  );

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
    name: 'generate-account-advertisement-monthly-statistics',
  })
  async executeScheduled(): Promise<void> {
    try {
      this.logger.log('Iniciando geração automática de estatísticas mensais');
      await this.execute();
      this.logger.log(
        'Geração automática de estatísticas mensais concluída com sucesso',
      );
    } catch (error) {
      this.logger.error(
        `Erro na geração automática de estatísticas mensais: ${error.message}`,
      );
      // Não propagar o erro para não interromper outros jobs agendados
    }
  }

  async execute(
    command?: GenerateAccountAdvertisementMonthlyStatisticsUseCaseCommand,
  ): Promise<void> {
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

        this.logger.log(
          `Gerando estatísticas para ${activeAccounts.length} contas ativas para o mês ${month}`,
        );

        for (const account of activeAccounts) {
          try {
            await this.generateStatisticsForAccount(account, month);
          } catch (error) {
            // Registrar erro, mas continuar com as próximas contas
            this.logger.error(
              `Erro ao gerar estatísticas para a conta ${account.id}: ${error.message}`,
            );
          }
        }

        this.logger.log(
          `Geração de estatísticas concluída para o mês ${month}`,
        );
      }
    } catch (error) {
      this.logger.error(`Erro ao gerar estatísticas: ${error.message}`);
      throw error;
    }
  }

  private async generateStatisticsForAccount(
    account: Account,
    month: string,
  ): Promise<AccountAdvertisementStatistics> {
    this.logger.log(
      `Gerando estatísticas para a conta ${account.id} no mês ${month}`,
    );

    // Verificar se já existem estatísticas para esta conta neste mês
    const existingStatistics =
      await this.accountAdvertisementStatisticsRepository.findByAccountIdAndMonth(
        account.id,
        month,
      );
    if (existingStatistics) {
      this.logger.log(
        `Estatísticas já existem para a conta ${account.id} no mês ${month}`,
      );
      return existingStatistics;
    }

    // Buscar todos os anúncios ativos da conta
    const { data: advertisements } =
      await this.advertisementRepository.findByAccountIdWithEvents(
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
    const lastAccumulatedStats =
      await this.accountAdvertisementStatisticsRepository.findLastAccumulatedByAccountId(
        account.id,
      );

    // Calcular dados do dashboard (consolida os valores que o frontend monta hoje).
    // Usa apenas os 4 status visíveis ao usuário final para bater com o universo atual do dashboard.
    const dashboardAdvertisements =
      this.filterAdvertisementsForDashboard(advertisements);
    const cumulativeDashboard = this.calculateDashboardCumulative(
      dashboardAdvertisements,
    );
    const accumulatedDashboard =
      this.buildAccumulatedDashboard(cumulativeDashboard);
    const dashboardData = this.buildDashboardData(
      cumulativeDashboard,
      lastAccumulatedStats?.accumulatedMetrics,
    );

    // Se não há estatísticas acumuladas anteriores, usar métricas acumulativas atuais
    if (!lastAccumulatedStats) {
      this.logger.log(
        `Não há estatísticas acumuladas anteriores para a conta ${account.id}. Usando valores acumulativos atuais.`,
      );

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
        dashboard: dashboardData,
        // Armazenar os valores acumulados com estrutura completa
        accumulatedMetrics: {
          dashboard: accumulatedDashboard,
          totalVisits: {
            total: currentMetrics.totalVisits.total,
            byTransactionType: {
              sale: currentMetrics.totalVisits.byTransactionType.sale,
              rent: currentMetrics.totalVisits.byTransactionType.rent,
            },
            byPropertyTypeAndTransaction: {
              house: {
                sale: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                  .house.sale,
                rent: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                  .house.rent,
              },
              apartment: {
                sale: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                  .apartment.sale,
                rent: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                  .apartment.rent,
              },
              lot: {
                sale: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                  .lot.sale,
                rent: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                  .lot.rent,
              },
              building: {
                sale: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                  .building.sale,
                rent: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                  .building.rent,
              },
              warehouse: {
                sale: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                  .warehouse.sale,
                rent: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                  .warehouse.rent,
              },
              office: {
                sale: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                  .office.sale,
                rent: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                  .office.rent,
              },
              commercial: {
                sale: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                  .commercial.sale,
                rent: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                  .commercial.rent,
              },
            },
          },
          phoneClicks: {
            total: currentMetrics.phoneClicks.total,
            byTransactionType: {
              sale: currentMetrics.phoneClicks.byTransactionType.sale,
              rent: currentMetrics.phoneClicks.byTransactionType.rent,
            },
            byPropertyTypeAndTransaction: {
              house: {
                sale: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                  .house.sale,
                rent: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                  .house.rent,
              },
              apartment: {
                sale: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                  .apartment.sale,
                rent: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                  .apartment.rent,
              },
              lot: {
                sale: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                  .lot.sale,
                rent: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                  .lot.rent,
              },
              building: {
                sale: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                  .building.sale,
                rent: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                  .building.rent,
              },
              warehouse: {
                sale: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                  .warehouse.sale,
                rent: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                  .warehouse.rent,
              },
              office: {
                sale: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                  .office.sale,
                rent: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                  .office.rent,
              },
              commercial: {
                sale: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                  .commercial.sale,
                rent: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                  .commercial.rent,
              },
            },
          },
          digitalCatalogViews: currentMetrics.digitalCatalogViews,
          contactInfoClicks: {
            total: currentMetrics.contactInfoClicks.total,
            byTransactionType: {
              sale: currentMetrics.contactInfoClicks.byTransactionType.sale,
              rent: currentMetrics.contactInfoClicks.byTransactionType.rent,
            },
            byPropertyTypeAndTransaction: {
              house: {
                sale: currentMetrics.contactInfoClicks
                  .byPropertyTypeAndTransaction.house.sale,
                rent: currentMetrics.contactInfoClicks
                  .byPropertyTypeAndTransaction.house.rent,
              },
              apartment: {
                sale: currentMetrics.contactInfoClicks
                  .byPropertyTypeAndTransaction.apartment.sale,
                rent: currentMetrics.contactInfoClicks
                  .byPropertyTypeAndTransaction.apartment.rent,
              },
              lot: {
                sale: currentMetrics.contactInfoClicks
                  .byPropertyTypeAndTransaction.lot.sale,
                rent: currentMetrics.contactInfoClicks
                  .byPropertyTypeAndTransaction.lot.rent,
              },
              building: {
                sale: currentMetrics.contactInfoClicks
                  .byPropertyTypeAndTransaction.building.sale,
                rent: currentMetrics.contactInfoClicks
                  .byPropertyTypeAndTransaction.building.rent,
              },
              warehouse: {
                sale: currentMetrics.contactInfoClicks
                  .byPropertyTypeAndTransaction.warehouse.sale,
                rent: currentMetrics.contactInfoClicks
                  .byPropertyTypeAndTransaction.warehouse.rent,
              },
              office: {
                sale: currentMetrics.contactInfoClicks
                  .byPropertyTypeAndTransaction.office.sale,
                rent: currentMetrics.contactInfoClicks
                  .byPropertyTypeAndTransaction.office.rent,
              },
              commercial: {
                sale: currentMetrics.contactInfoClicks
                  .byPropertyTypeAndTransaction.commercial.sale,
                rent: currentMetrics.contactInfoClicks
                  .byPropertyTypeAndTransaction.commercial.rent,
              },
            },
          },
        },
      });

      // Salvar estatísticas
      return this.accountAdvertisementStatisticsRepository.create(statistics);
    }

    // Calcular métricas diferenciais subtraindo valores acumulados anteriores
    this.logger.log(
      `Calculando valores diferenciais usando estatísticas acumuladas anteriores`,
    );

    // Verificar se o registro acumulado tem o campo accumulatedMetrics
    // Se não tiver, criar um com base nos valores do próprio registro
    const accumulatedMetrics = lastAccumulatedStats.accumulatedMetrics || {
      totalVisits: {
        total: lastAccumulatedStats.totalVisits?.total || 0,
        byTransactionType: {
          sale: lastAccumulatedStats.totalVisits?.byTransactionType?.sale || 0,
          rent: lastAccumulatedStats.totalVisits?.byTransactionType?.rent || 0,
        },
        byPropertyTypeAndTransaction: {
          house: {
            sale:
              lastAccumulatedStats.totalVisits?.byPropertyTypeAndTransaction
                ?.house?.sale || 0,
            rent:
              lastAccumulatedStats.totalVisits?.byPropertyTypeAndTransaction
                ?.house?.rent || 0,
          },
          apartment: {
            sale:
              lastAccumulatedStats.totalVisits?.byPropertyTypeAndTransaction
                ?.apartment?.sale || 0,
            rent:
              lastAccumulatedStats.totalVisits?.byPropertyTypeAndTransaction
                ?.apartment?.rent || 0,
          },
          lot: {
            sale:
              lastAccumulatedStats.totalVisits?.byPropertyTypeAndTransaction
                ?.lot?.sale || 0,
            rent:
              lastAccumulatedStats.totalVisits?.byPropertyTypeAndTransaction
                ?.lot?.rent || 0,
          },
          building: {
            sale:
              lastAccumulatedStats.totalVisits?.byPropertyTypeAndTransaction
                ?.building?.sale || 0,
            rent:
              lastAccumulatedStats.totalVisits?.byPropertyTypeAndTransaction
                ?.building?.rent || 0,
          },
          warehouse: {
            sale:
              lastAccumulatedStats.totalVisits?.byPropertyTypeAndTransaction
                ?.warehouse?.sale || 0,
            rent:
              lastAccumulatedStats.totalVisits?.byPropertyTypeAndTransaction
                ?.warehouse?.rent || 0,
          },
          office: {
            sale:
              lastAccumulatedStats.totalVisits?.byPropertyTypeAndTransaction
                ?.office?.sale || 0,
            rent:
              lastAccumulatedStats.totalVisits?.byPropertyTypeAndTransaction
                ?.office?.rent || 0,
          },
          commercial: {
            sale:
              lastAccumulatedStats.totalVisits?.byPropertyTypeAndTransaction
                ?.commercial?.sale || 0,
            rent:
              lastAccumulatedStats.totalVisits?.byPropertyTypeAndTransaction
                ?.commercial?.rent || 0,
          },
        },
      },
      phoneClicks: {
        total: lastAccumulatedStats.phoneClicks?.total || 0,
        byTransactionType: {
          sale: lastAccumulatedStats.phoneClicks?.byTransactionType?.sale || 0,
          rent: lastAccumulatedStats.phoneClicks?.byTransactionType?.rent || 0,
        },
        byPropertyTypeAndTransaction: {
          house: {
            sale:
              lastAccumulatedStats.phoneClicks?.byPropertyTypeAndTransaction
                ?.house?.sale || 0,
            rent:
              lastAccumulatedStats.phoneClicks?.byPropertyTypeAndTransaction
                ?.house?.rent || 0,
          },
          apartment: {
            sale:
              lastAccumulatedStats.phoneClicks?.byPropertyTypeAndTransaction
                ?.apartment?.sale || 0,
            rent:
              lastAccumulatedStats.phoneClicks?.byPropertyTypeAndTransaction
                ?.apartment?.rent || 0,
          },
          lot: {
            sale:
              lastAccumulatedStats.phoneClicks?.byPropertyTypeAndTransaction
                ?.lot?.sale || 0,
            rent:
              lastAccumulatedStats.phoneClicks?.byPropertyTypeAndTransaction
                ?.lot?.rent || 0,
          },
          building: {
            sale:
              lastAccumulatedStats.phoneClicks?.byPropertyTypeAndTransaction
                ?.building?.sale || 0,
            rent:
              lastAccumulatedStats.phoneClicks?.byPropertyTypeAndTransaction
                ?.building?.rent || 0,
          },
          warehouse: {
            sale:
              lastAccumulatedStats.phoneClicks?.byPropertyTypeAndTransaction
                ?.warehouse?.sale || 0,
            rent:
              lastAccumulatedStats.phoneClicks?.byPropertyTypeAndTransaction
                ?.warehouse?.rent || 0,
          },
          office: {
            sale:
              lastAccumulatedStats.phoneClicks?.byPropertyTypeAndTransaction
                ?.office?.sale || 0,
            rent:
              lastAccumulatedStats.phoneClicks?.byPropertyTypeAndTransaction
                ?.office?.rent || 0,
          },
          commercial: {
            sale:
              lastAccumulatedStats.phoneClicks?.byPropertyTypeAndTransaction
                ?.commercial?.sale || 0,
            rent:
              lastAccumulatedStats.phoneClicks?.byPropertyTypeAndTransaction
                ?.commercial?.rent || 0,
          },
        },
      },
      digitalCatalogViews: lastAccumulatedStats.digitalCatalogViews || 0,
      contactInfoClicks: {
        total: lastAccumulatedStats.contactInfoClicks?.total || 0,
        byTransactionType: {
          sale:
            lastAccumulatedStats.contactInfoClicks?.byTransactionType?.sale ||
            0,
          rent:
            lastAccumulatedStats.contactInfoClicks?.byTransactionType?.rent ||
            0,
        },
        byPropertyTypeAndTransaction: {
          house: {
            sale:
              lastAccumulatedStats.contactInfoClicks
                ?.byPropertyTypeAndTransaction?.house?.sale || 0,
            rent:
              lastAccumulatedStats.contactInfoClicks
                ?.byPropertyTypeAndTransaction?.house?.rent || 0,
          },
          apartment: {
            sale:
              lastAccumulatedStats.contactInfoClicks
                ?.byPropertyTypeAndTransaction?.apartment?.sale || 0,
            rent:
              lastAccumulatedStats.contactInfoClicks
                ?.byPropertyTypeAndTransaction?.apartment?.rent || 0,
          },
          lot: {
            sale:
              lastAccumulatedStats.contactInfoClicks
                ?.byPropertyTypeAndTransaction?.lot?.sale || 0,
            rent:
              lastAccumulatedStats.contactInfoClicks
                ?.byPropertyTypeAndTransaction?.lot?.rent || 0,
          },
          building: {
            sale:
              lastAccumulatedStats.contactInfoClicks
                ?.byPropertyTypeAndTransaction?.building?.sale || 0,
            rent:
              lastAccumulatedStats.contactInfoClicks
                ?.byPropertyTypeAndTransaction?.building?.rent || 0,
          },
          warehouse: {
            sale:
              lastAccumulatedStats.contactInfoClicks
                ?.byPropertyTypeAndTransaction?.warehouse?.sale || 0,
            rent:
              lastAccumulatedStats.contactInfoClicks
                ?.byPropertyTypeAndTransaction?.warehouse?.rent || 0,
          },
          office: {
            sale:
              lastAccumulatedStats.contactInfoClicks
                ?.byPropertyTypeAndTransaction?.office?.sale || 0,
            rent:
              lastAccumulatedStats.contactInfoClicks
                ?.byPropertyTypeAndTransaction?.office?.rent || 0,
          },
          commercial: {
            sale:
              lastAccumulatedStats.contactInfoClicks
                ?.byPropertyTypeAndTransaction?.commercial?.sale || 0,
            rent:
              lastAccumulatedStats.contactInfoClicks
                ?.byPropertyTypeAndTransaction?.commercial?.rent || 0,
          },
        },
      },
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
        accumulatedMetrics.totalVisits,
      ),

      phoneClicks: this.calculateDifferentialMetricBaseFromAccumulatedDetailed(
        currentMetrics.phoneClicks,
        accumulatedMetrics.phoneClicks,
      ),

      digitalCatalogViews: Math.max(
        0,
        currentMetrics.digitalCatalogViews -
          accumulatedMetrics.digitalCatalogViews,
      ),

      contactInfoClicks:
        this.calculateDifferentialMetricBaseFromAccumulatedDetailed(
          currentMetrics.contactInfoClicks,
          accumulatedMetrics.contactInfoClicks,
        ),

      // Para os rankings, continuamos usando o método existente
      topViewedAdvertisements: this.calculateDifferentialTopAdvertisements(
        currentMetrics.topViewedAdvertisements,
        lastAccumulatedStats.topViewedAdvertisements,
      ),

      topInteractedAdvertisements: this.calculateDifferentialTopAdvertisements(
        currentMetrics.topInteractedAdvertisements,
        lastAccumulatedStats.topInteractedAdvertisements,
      ),

      dashboard: dashboardData,

      // Armazenar os valores acumulados atuais com estrutura completa
      accumulatedMetrics: {
        dashboard: accumulatedDashboard,
        totalVisits: {
          total: currentMetrics.totalVisits.total,
          byTransactionType: {
            sale: currentMetrics.totalVisits.byTransactionType.sale,
            rent: currentMetrics.totalVisits.byTransactionType.rent,
          },
          byPropertyTypeAndTransaction: {
            house: {
              sale: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                .house.sale,
              rent: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                .house.rent,
            },
            apartment: {
              sale: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                .apartment.sale,
              rent: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                .apartment.rent,
            },
            lot: {
              sale: currentMetrics.totalVisits.byPropertyTypeAndTransaction.lot
                .sale,
              rent: currentMetrics.totalVisits.byPropertyTypeAndTransaction.lot
                .rent,
            },
            building: {
              sale: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                .building.sale,
              rent: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                .building.rent,
            },
            warehouse: {
              sale: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                .warehouse.sale,
              rent: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                .warehouse.rent,
            },
            office: {
              sale: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                .office.sale,
              rent: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                .office.rent,
            },
            commercial: {
              sale: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                .commercial.sale,
              rent: currentMetrics.totalVisits.byPropertyTypeAndTransaction
                .commercial.rent,
            },
          },
        },
        phoneClicks: {
          total: currentMetrics.phoneClicks.total,
          byTransactionType: {
            sale: currentMetrics.phoneClicks.byTransactionType.sale,
            rent: currentMetrics.phoneClicks.byTransactionType.rent,
          },
          byPropertyTypeAndTransaction: {
            house: {
              sale: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                .house.sale,
              rent: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                .house.rent,
            },
            apartment: {
              sale: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                .apartment.sale,
              rent: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                .apartment.rent,
            },
            lot: {
              sale: currentMetrics.phoneClicks.byPropertyTypeAndTransaction.lot
                .sale,
              rent: currentMetrics.phoneClicks.byPropertyTypeAndTransaction.lot
                .rent,
            },
            building: {
              sale: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                .building.sale,
              rent: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                .building.rent,
            },
            warehouse: {
              sale: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                .warehouse.sale,
              rent: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                .warehouse.rent,
            },
            office: {
              sale: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                .office.sale,
              rent: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                .office.rent,
            },
            commercial: {
              sale: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                .commercial.sale,
              rent: currentMetrics.phoneClicks.byPropertyTypeAndTransaction
                .commercial.rent,
            },
          },
        },
        digitalCatalogViews: currentMetrics.digitalCatalogViews,
        contactInfoClicks: {
          total: currentMetrics.contactInfoClicks.total,
          byTransactionType: {
            sale: currentMetrics.contactInfoClicks.byTransactionType.sale,
            rent: currentMetrics.contactInfoClicks.byTransactionType.rent,
          },
          byPropertyTypeAndTransaction: {
            house: {
              sale: currentMetrics.contactInfoClicks
                .byPropertyTypeAndTransaction.house.sale,
              rent: currentMetrics.contactInfoClicks
                .byPropertyTypeAndTransaction.house.rent,
            },
            apartment: {
              sale: currentMetrics.contactInfoClicks
                .byPropertyTypeAndTransaction.apartment.sale,
              rent: currentMetrics.contactInfoClicks
                .byPropertyTypeAndTransaction.apartment.rent,
            },
            lot: {
              sale: currentMetrics.contactInfoClicks
                .byPropertyTypeAndTransaction.lot.sale,
              rent: currentMetrics.contactInfoClicks
                .byPropertyTypeAndTransaction.lot.rent,
            },
            building: {
              sale: currentMetrics.contactInfoClicks
                .byPropertyTypeAndTransaction.building.sale,
              rent: currentMetrics.contactInfoClicks
                .byPropertyTypeAndTransaction.building.rent,
            },
            warehouse: {
              sale: currentMetrics.contactInfoClicks
                .byPropertyTypeAndTransaction.warehouse.sale,
              rent: currentMetrics.contactInfoClicks
                .byPropertyTypeAndTransaction.warehouse.rent,
            },
            office: {
              sale: currentMetrics.contactInfoClicks
                .byPropertyTypeAndTransaction.office.sale,
              rent: currentMetrics.contactInfoClicks
                .byPropertyTypeAndTransaction.office.rent,
            },
            commercial: {
              sale: currentMetrics.contactInfoClicks
                .byPropertyTypeAndTransaction.commercial.sale,
              rent: currentMetrics.contactInfoClicks
                .byPropertyTypeAndTransaction.commercial.rent,
            },
          },
        },
      },
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
      building: { sale: 0, rent: 0 },
      warehouse: { sale: 0, rent: 0 },
      office: { sale: 0, rent: 0 },
      commercial: { sale: 0, rent: 0 },
    };

    const visitsByTransactionType = {
      sale: 0,
      rent: 0,
    };

    const visitsByPropertyTypeAndTransaction = {
      house: { sale: 0, rent: 0 },
      apartment: { sale: 0, rent: 0 },
      lot: { sale: 0, rent: 0 },
      building: { sale: 0, rent: 0 },
      warehouse: { sale: 0, rent: 0 },
      office: { sale: 0, rent: 0 },
      commercial: { sale: 0, rent: 0 },
    };

    const phoneClicksByTransactionType = {
      sale: 0,
      rent: 0,
    };

    const phoneClicksByPropertyTypeAndTransaction = {
      house: { sale: 0, rent: 0 },
      apartment: { sale: 0, rent: 0 },
      lot: { sale: 0, rent: 0 },
      building: { sale: 0, rent: 0 },
      warehouse: { sale: 0, rent: 0 },
      office: { sale: 0, rent: 0 },
      commercial: { sale: 0, rent: 0 },
    };

    const contactInfoClicksByTransactionType = {
      sale: 0,
      rent: 0,
    };

    const contactInfoClicksByPropertyTypeAndTransaction = {
      house: { sale: 0, rent: 0 },
      apartment: { sale: 0, rent: 0 },
      lot: { sale: 0, rent: 0 },
      building: { sale: 0, rent: 0 },
      warehouse: { sale: 0, rent: 0 },
      office: { sale: 0, rent: 0 },
      commercial: { sale: 0, rent: 0 },
    };

    let digitalCatalogViews = 0;

    // Arrays para armazenar métricas de anúncios para rankings
    const advertisementViewsMap: Map<
      string,
      {
        advertisementId: string;
        views: number;
        transactionType: AdvertisementTransactionType;
      }
    > = new Map();
    const advertisementInteractionsMap: Map<
      string,
      {
        advertisementId: string;
        interactions: number;
        transactionType: AdvertisementTransactionType;
      }
    > = new Map();

    // Calcular métricas para cada anúncio
    for (const advertisement of advertisements) {
      // Contar anúncios por tipo de transação e propriedade
      const transactionType = this.mapTransactionType(
        advertisement.transactionType,
      );
      const propertyType = this.mapPropertyType(advertisement.type);

      totalByTransactionType[transactionType]++;
      totalByPropertyTypeAndTransaction[propertyType][transactionType]++;

      // Contar visualizações e interações
      let views = 0;
      let phoneClicks = 0;
      let contactInfoClicks = 0;

      // Processar eventos de anúncio
      if (
        advertisement.advertisementEvents &&
        advertisement.advertisementEvents.length > 0
      ) {
        for (const event of advertisement.advertisementEvents) {
          switch (event.type) {
            case 'AD_VIEW':
              views += event.count;
              visitsByTransactionType[transactionType] += event.count;
              visitsByPropertyTypeAndTransaction[propertyType][
                transactionType
              ] += event.count;
              break;
            case 'AD_PHONE_CLICK':
              phoneClicks += event.count;
              phoneClicksByTransactionType[transactionType] += event.count;
              phoneClicksByPropertyTypeAndTransaction[propertyType][
                transactionType
              ] += event.count;
              break;
            case 'AD_CONTACT_CLICK':
              contactInfoClicks += event.count;
              contactInfoClicksByTransactionType[transactionType] +=
                event.count;
              contactInfoClicksByPropertyTypeAndTransaction[propertyType][
                transactionType
              ] += event.count;
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
    const totalVisits = Object.values(visitsByTransactionType).reduce(
      (sum, count) => sum + count,
      0,
    );
    const totalPhoneClicks = Object.values(phoneClicksByTransactionType).reduce(
      (sum, count) => sum + count,
      0,
    );
    const totalContactInfoClicks = Object.values(
      contactInfoClicksByTransactionType,
    ).reduce((sum, count) => sum + count, 0);

    // Criar rankings de anúncios mais visualizados
    const topViewedSale = Array.from(advertisementViewsMap.values())
      .filter(
        (item) => item.transactionType === AdvertisementTransactionType.SALE,
      )
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(
        (item) =>
          new AdvertisementMetric({
            advertisementId: item.advertisementId,
            views: item.views,
          }),
      );

    const topViewedRent = Array.from(advertisementViewsMap.values())
      .filter(
        (item) => item.transactionType === AdvertisementTransactionType.RENT,
      )
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(
        (item) =>
          new AdvertisementMetric({
            advertisementId: item.advertisementId,
            views: item.views,
          }),
      );

    // Criar rankings de anúncios com mais interações
    const topInteractedSale = Array.from(advertisementInteractionsMap.values())
      .filter(
        (item) => item.transactionType === AdvertisementTransactionType.SALE,
      )
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 10)
      .map(
        (item) =>
          new AdvertisementMetric({
            advertisementId: item.advertisementId,
            interactions: item.interactions,
          }),
      );

    const topInteractedRent = Array.from(advertisementInteractionsMap.values())
      .filter(
        (item) => item.transactionType === AdvertisementTransactionType.RENT,
      )
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 10)
      .map(
        (item) =>
          new AdvertisementMetric({
            advertisementId: item.advertisementId,
            interactions: item.interactions,
          }),
      );

    // Criar objetos de métricas
    return {
      totalAdvertisements: new TotalAdvertisements({
        total: totalAdvertisements,
        byTransactionType: new TransactionTypeMetrics(totalByTransactionType),
        byPropertyTypeAndTransaction: new PropertyTypeAndTransactionMetrics(
          totalByPropertyTypeAndTransaction,
        ),
      }),
      totalVisits: new TotalVisits({
        total: totalVisits,
        byTransactionType: new TransactionTypeMetrics(visitsByTransactionType),
        byPropertyTypeAndTransaction: new PropertyTypeAndTransactionMetrics(
          visitsByPropertyTypeAndTransaction,
        ),
      }),
      phoneClicks: new PhoneClicks({
        total: totalPhoneClicks,
        byTransactionType: new TransactionTypeMetrics(
          phoneClicksByTransactionType,
        ),
        byPropertyTypeAndTransaction: new PropertyTypeAndTransactionMetrics(
          phoneClicksByPropertyTypeAndTransaction,
        ),
      }),
      digitalCatalogViews,
      contactInfoClicks: new ContactInfoClicks({
        total: totalContactInfoClicks,
        byTransactionType: new TransactionTypeMetrics(
          contactInfoClicksByTransactionType,
        ),
        byPropertyTypeAndTransaction: new PropertyTypeAndTransactionMetrics(
          contactInfoClicksByPropertyTypeAndTransaction,
        ),
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

  private createEmptyStatistics(
    accountId: string,
    month: string,
  ): Promise<AccountAdvertisementStatistics> {
    const emptyMetricBase = {
      total: 0,
      byTransactionType: { sale: 0, rent: 0 },
      byPropertyTypeAndTransaction: {
        house: { sale: 0, rent: 0 },
        apartment: { sale: 0, rent: 0 },
        lot: { sale: 0, rent: 0 },
        building: { sale: 0, rent: 0 },
        warehouse: { sale: 0, rent: 0 },
        office: { sale: 0, rent: 0 },
        commercial: { sale: 0, rent: 0 },
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
      dashboard: this.buildEmptyDashboard(),
      // Adicionar valores acumulados vazios com estrutura completa
      accumulatedMetrics: {
        dashboard: this.buildEmptyAccumulatedDashboard(),
        totalVisits: {
          total: 0,
          byTransactionType: {
            sale: 0,
            rent: 0,
          },
          byPropertyTypeAndTransaction: {
            house: { sale: 0, rent: 0 },
            apartment: { sale: 0, rent: 0 },
            lot: { sale: 0, rent: 0 },
            building: { sale: 0, rent: 0 },
            warehouse: { sale: 0, rent: 0 },
            office: { sale: 0, rent: 0 },
            commercial: { sale: 0, rent: 0 },
          },
        },
        phoneClicks: {
          total: 0,
          byTransactionType: {
            sale: 0,
            rent: 0,
          },
          byPropertyTypeAndTransaction: {
            house: { sale: 0, rent: 0 },
            apartment: { sale: 0, rent: 0 },
            lot: { sale: 0, rent: 0 },
            building: { sale: 0, rent: 0 },
            warehouse: { sale: 0, rent: 0 },
            office: { sale: 0, rent: 0 },
            commercial: { sale: 0, rent: 0 },
          },
        },
        digitalCatalogViews: 0,
        contactInfoClicks: {
          total: 0,
          byTransactionType: {
            sale: 0,
            rent: 0,
          },
          byPropertyTypeAndTransaction: {
            house: { sale: 0, rent: 0 },
            apartment: { sale: 0, rent: 0 },
            lot: { sale: 0, rent: 0 },
            building: { sale: 0, rent: 0 },
            warehouse: { sale: 0, rent: 0 },
            office: { sale: 0, rent: 0 },
            commercial: { sale: 0, rent: 0 },
          },
        },
      },
    });

    return this.accountAdvertisementStatisticsRepository.create(statistics);
  }

  private getPreviousMonth(): string {
    const date = new Date(
      Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate(),
        new Date().getUTCHours(),
        new Date().getUTCMinutes(),
        new Date().getUTCSeconds(),
        new Date().getUTCMilliseconds(),
      ),
    );
    // Subtrair um mês da data atual
    date.setMonth(date.getMonth() - 1);
    // Formatar como YYYY-MM
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private mapPropertyType(
    type: AdvertisementType,
  ):
    | 'house'
    | 'apartment'
    | 'lot'
    | 'building'
    | 'warehouse'
    | 'office'
    | 'commercial' {
    switch (type) {
      case AdvertisementType.HOUSE:
        return 'house';
      case AdvertisementType.APARTMENT:
        return 'apartment';
      case AdvertisementType.LOT:
        return 'lot';
      case AdvertisementType.BUILDING:
        return 'building';
      case AdvertisementType.WAREHOUSE:
        return 'warehouse';
      case AdvertisementType.OFFICE:
        return 'office';
      case AdvertisementType.COMMERCIAL:
        return 'commercial';
      default:
        return 'house';
    }
  }

  private mapTransactionType(
    type: AdvertisementTransactionType,
  ): 'sale' | 'rent' {
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
    previous: T,
  ): T {
    // Criar uma nova instância do mesmo tipo
    const Constructor = current.constructor as new (props: MetricBase) => T;

    // Calcular total diferencial (nunca negativo)
    const total = Math.max(0, current.total - previous.total);

    // Calcular valores diferenciais por tipo de transação
    const byTransactionType = {
      sale: Math.max(
        0,
        current.byTransactionType.sale - previous.byTransactionType.sale,
      ),
      rent: Math.max(
        0,
        current.byTransactionType.rent - previous.byTransactionType.rent,
      ),
    };

    // Calcular valores diferenciais por tipo de propriedade e transação
    const byPropertyTypeAndTransaction = {
      house: {
        sale: Math.max(
          0,
          current.byPropertyTypeAndTransaction.house.sale -
            previous.byPropertyTypeAndTransaction.house.sale,
        ),
        rent: Math.max(
          0,
          current.byPropertyTypeAndTransaction.house.rent -
            previous.byPropertyTypeAndTransaction.house.rent,
        ),
      },
      apartment: {
        sale: Math.max(
          0,
          current.byPropertyTypeAndTransaction.apartment.sale -
            previous.byPropertyTypeAndTransaction.apartment.sale,
        ),
        rent: Math.max(
          0,
          current.byPropertyTypeAndTransaction.apartment.rent -
            previous.byPropertyTypeAndTransaction.apartment.rent,
        ),
      },
      lot: {
        sale: Math.max(
          0,
          current.byPropertyTypeAndTransaction.lot.sale -
            previous.byPropertyTypeAndTransaction.lot.sale,
        ),
        rent: Math.max(
          0,
          current.byPropertyTypeAndTransaction.lot.rent -
            previous.byPropertyTypeAndTransaction.lot.rent,
        ),
      },
      building: {
        sale: Math.max(
          0,
          current.byPropertyTypeAndTransaction.building.sale -
            previous.byPropertyTypeAndTransaction.building.sale,
        ),
        rent: Math.max(
          0,
          current.byPropertyTypeAndTransaction.building.rent -
            previous.byPropertyTypeAndTransaction.building.rent,
        ),
      },
      warehouse: {
        sale: Math.max(
          0,
          current.byPropertyTypeAndTransaction.warehouse.sale -
            previous.byPropertyTypeAndTransaction.warehouse.sale,
        ),
        rent: Math.max(
          0,
          current.byPropertyTypeAndTransaction.warehouse.rent -
            previous.byPropertyTypeAndTransaction.warehouse.rent,
        ),
      },
      office: {
        sale: Math.max(
          0,
          current.byPropertyTypeAndTransaction.office.sale -
            previous.byPropertyTypeAndTransaction.office.sale,
        ),
        rent: Math.max(
          0,
          current.byPropertyTypeAndTransaction.office.rent -
            previous.byPropertyTypeAndTransaction.office.rent,
        ),
      },
      commercial: {
        sale: Math.max(
          0,
          current.byPropertyTypeAndTransaction.commercial.sale -
            previous.byPropertyTypeAndTransaction.commercial.sale,
        ),
        rent: Math.max(
          0,
          current.byPropertyTypeAndTransaction.commercial.rent -
            previous.byPropertyTypeAndTransaction.commercial.rent,
        ),
      },
    };

    // Criar nova instância da métrica com valores diferenciais
    return new Constructor({
      total,
      byTransactionType: new TransactionTypeMetrics(byTransactionType),
      byPropertyTypeAndTransaction: new PropertyTypeAndTransactionMetrics(
        byPropertyTypeAndTransaction,
      ),
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
    previousAccumulatedTotal: number,
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
        sale: Math.round(
          current.byPropertyTypeAndTransaction.house.sale * ratio,
        ),
        rent: Math.round(
          current.byPropertyTypeAndTransaction.house.rent * ratio,
        ),
      },
      apartment: {
        sale: Math.round(
          current.byPropertyTypeAndTransaction.apartment.sale * ratio,
        ),
        rent: Math.round(
          current.byPropertyTypeAndTransaction.apartment.rent * ratio,
        ),
      },
      lot: {
        sale: Math.round(current.byPropertyTypeAndTransaction.lot.sale * ratio),
        rent: Math.round(current.byPropertyTypeAndTransaction.lot.rent * ratio),
      },
      building: {
        sale: Math.round(
          current.byPropertyTypeAndTransaction.building.sale * ratio,
        ),
        rent: Math.round(
          current.byPropertyTypeAndTransaction.building.rent * ratio,
        ),
      },
      warehouse: {
        sale: Math.round(
          current.byPropertyTypeAndTransaction.warehouse.sale * ratio,
        ),
        rent: Math.round(
          current.byPropertyTypeAndTransaction.warehouse.rent * ratio,
        ),
      },
      office: {
        sale: Math.round(
          current.byPropertyTypeAndTransaction.office.sale * ratio,
        ),
        rent: Math.round(
          current.byPropertyTypeAndTransaction.office.rent * ratio,
        ),
      },
      commercial: {
        sale: Math.round(
          current.byPropertyTypeAndTransaction.commercial.sale * ratio,
        ),
        rent: Math.round(
          current.byPropertyTypeAndTransaction.commercial.rent * ratio,
        ),
      },
    };

    // Criar nova instância da métrica com valores diferenciais
    return new Constructor({
      total,
      byTransactionType: new TransactionTypeMetrics(byTransactionType),
      byPropertyTypeAndTransaction: new PropertyTypeAndTransactionMetrics(
        byPropertyTypeAndTransaction,
      ),
    });
  }

  /**
   * Calcula métricas diferenciais de base usando a estrutura detalhada de métricas acumuladas
   * Esta versão usa os valores detalhados por tipo de transação e propriedade
   */
  private calculateDifferentialMetricBaseFromAccumulatedDetailed<
    T extends MetricBase,
  >(
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
        building: { sale: number; rent: number };
        warehouse: { sale: number; rent: number };
        office: { sale: number; rent: number };
        commercial: { sale: number; rent: number };
      };
    },
  ): T {
    // Criar uma nova instância do mesmo tipo
    const Constructor = current.constructor as new (props: MetricBase) => T;

    // Calcular total diferencial (nunca negativo)
    const total = Math.max(0, current.total - previousAccumulated.total);

    // Calcular valores diferenciais por tipo de transação
    const byTransactionType = {
      sale: Math.max(
        0,
        current.byTransactionType.sale -
          previousAccumulated.byTransactionType.sale,
      ),
      rent: Math.max(
        0,
        current.byTransactionType.rent -
          previousAccumulated.byTransactionType.rent,
      ),
    };

    // Calcular valores diferenciais por tipo de propriedade e transação
    const byPropertyTypeAndTransaction = {
      house: {
        sale: Math.max(
          0,
          current.byPropertyTypeAndTransaction.house.sale -
            previousAccumulated.byPropertyTypeAndTransaction.house.sale,
        ),
        rent: Math.max(
          0,
          current.byPropertyTypeAndTransaction.house.rent -
            previousAccumulated.byPropertyTypeAndTransaction.house.rent,
        ),
      },
      apartment: {
        sale: Math.max(
          0,
          current.byPropertyTypeAndTransaction.apartment.sale -
            previousAccumulated.byPropertyTypeAndTransaction.apartment.sale,
        ),
        rent: Math.max(
          0,
          current.byPropertyTypeAndTransaction.apartment.rent -
            previousAccumulated.byPropertyTypeAndTransaction.apartment.rent,
        ),
      },
      lot: {
        sale: Math.max(
          0,
          current.byPropertyTypeAndTransaction.lot.sale -
            previousAccumulated.byPropertyTypeAndTransaction.lot.sale,
        ),
        rent: Math.max(
          0,
          current.byPropertyTypeAndTransaction.lot.rent -
            previousAccumulated.byPropertyTypeAndTransaction.lot.rent,
        ),
      },
      building: {
        sale: Math.max(
          0,
          current.byPropertyTypeAndTransaction.building.sale -
            previousAccumulated.byPropertyTypeAndTransaction.building.sale,
        ),
        rent: Math.max(
          0,
          current.byPropertyTypeAndTransaction.building.rent -
            previousAccumulated.byPropertyTypeAndTransaction.building.rent,
        ),
      },
      warehouse: {
        sale: Math.max(
          0,
          current.byPropertyTypeAndTransaction.warehouse.sale -
            previousAccumulated.byPropertyTypeAndTransaction.warehouse.sale,
        ),
        rent: Math.max(
          0,
          current.byPropertyTypeAndTransaction.warehouse.rent -
            previousAccumulated.byPropertyTypeAndTransaction.warehouse.rent,
        ),
      },
      office: {
        sale: Math.max(
          0,
          current.byPropertyTypeAndTransaction.office.sale -
            previousAccumulated.byPropertyTypeAndTransaction.office.sale,
        ),
        rent: Math.max(
          0,
          current.byPropertyTypeAndTransaction.office.rent -
            previousAccumulated.byPropertyTypeAndTransaction.office.rent,
        ),
      },
      commercial: {
        sale: Math.max(
          0,
          current.byPropertyTypeAndTransaction.commercial.sale -
            previousAccumulated.byPropertyTypeAndTransaction.commercial.sale,
        ),
        rent: Math.max(
          0,
          current.byPropertyTypeAndTransaction.commercial.rent -
            previousAccumulated.byPropertyTypeAndTransaction.commercial.rent,
        ),
      },
    };

    // Criar nova instância da métrica com valores diferenciais
    return new Constructor({
      total,
      byTransactionType: new TransactionTypeMetrics(byTransactionType),
      byPropertyTypeAndTransaction: new PropertyTypeAndTransactionMetrics(
        byPropertyTypeAndTransaction,
      ),
    });
  }

  private calculateDifferentialTopAdvertisements(
    current: TopAdvertisements,
    previous: TopAdvertisements,
  ): TopAdvertisements {
    // Mapear anúncios do mês anterior para facilitar a busca
    const prevSaleMap = new Map<string, AdvertisementMetric>();
    const prevRentMap = new Map<string, AdvertisementMetric>();

    // Preencher os mapas com dados do mês anterior
    previous.sale.forEach((item) => {
      prevSaleMap.set(item.advertisementId, item);
    });

    previous.rent.forEach((item) => {
      prevRentMap.set(item.advertisementId, item);
    });

    // Calcular valores diferenciais para anúncios de venda
    const saleDifferential = current.sale.map((item) => {
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
      const views =
        item.views !== undefined && prevItem.views !== undefined
          ? Math.max(0, item.views - prevItem.views)
          : item.views;

      const interactions =
        item.interactions !== undefined && prevItem.interactions !== undefined
          ? Math.max(0, item.interactions - prevItem.interactions)
          : item.interactions;

      return new AdvertisementMetric({
        advertisementId: item.advertisementId,
        views,
        interactions,
      });
    });

    // Calcular valores diferenciais para anúncios de aluguel (mesmo processo)
    const rentDifferential = current.rent.map((item) => {
      const prevItem = prevRentMap.get(item.advertisementId);

      if (!prevItem) {
        return new AdvertisementMetric({
          advertisementId: item.advertisementId,
          views: item.views,
          interactions: item.interactions,
        });
      }

      const views =
        item.views !== undefined && prevItem.views !== undefined
          ? Math.max(0, item.views - prevItem.views)
          : item.views;

      const interactions =
        item.interactions !== undefined && prevItem.interactions !== undefined
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
      .filter((item) => (item.views || 0) > 0 || (item.interactions || 0) > 0) // Remover itens sem atividade
      .sort((a, b) => {
        // Ordenar por views se disponível, caso contrário por interactions
        if (a.views !== undefined && b.views !== undefined) {
          return b.views - a.views;
        }
        return (b.interactions || 0) - (a.interactions || 0);
      })
      .slice(0, 10); // Manter apenas os top 10

    const sortedRent = rentDifferential
      .filter((item) => (item.views || 0) > 0 || (item.interactions || 0) > 0)
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

  private filterAdvertisementsForDashboard(
    advertisements: Advertisement[],
  ): Advertisement[] {
    const allowed = new Set<string>(
      DASHBOARD_STATUSES as unknown as string[],
    );
    return advertisements.filter((ad) =>
      allowed.has(ad.status as unknown as string),
    );
  }

  private normalizeLocationKey(value?: string): string {
    const trimmed = (value || '').trim();
    if (!trimmed) return UNKNOWN_LOCATION_KEY;
    return trimmed.toUpperCase();
  }

  private resolveLocationLabel(key: string): string {
    if (key === UNKNOWN_LOCATION_KEY) return UNKNOWN_LOCATION_LABEL;
    if (!key) return '';
    return key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
  }

  private diff(current: number, previous: number): number {
    return Math.max(0, (current || 0) - (previous || 0));
  }

  private calculateDashboardCumulative(
    advertisements: Advertisement[],
  ): CumulativeDashboardSnapshot {
    const emptyEvents = (): DashboardEventCounts => ({
      views: 0,
      whatsappClicks: 0,
      phoneClicks: 0,
      catalogViews: 0,
    });
    const emptyPropCount = (): DashboardPropertyCount => ({
      properties: 0,
      activeProperties: 0,
    });

    const summary = {
      totalProperties: 0,
      activeProperties: 0,
      totalAdViews: 0,
      totalAdWhatsappClicks: 0,
      totalAdPhoneClicks: 0,
      totalAdCatalogViews: 0,
    };

    const propertyCountsByTransaction: Record<
      'sale' | 'rent',
      DashboardPropertyCount
    > = {
      sale: emptyPropCount(),
      rent: emptyPropCount(),
    };

    const propertyCountsByPropertyType = Object.fromEntries(
      PROPERTY_TYPE_KEYS.map((k) => [k, emptyPropCount()]),
    ) as Record<PropertyTypeKey, DashboardPropertyCount>;

    const propertyCountsByPropertyTypeAndTransaction = Object.fromEntries(
      PROPERTY_TYPE_KEYS.map((k) => [k, { rent: 0, sale: 0 }]),
    ) as Record<PropertyTypeKey, { rent: number; sale: number }>;

    const eventCountsByTransaction: Record<
      'sale' | 'rent',
      DashboardEventCounts
    > = {
      sale: emptyEvents(),
      rent: emptyEvents(),
    };

    const eventCountsByPropertyType = Object.fromEntries(
      PROPERTY_TYPE_KEYS.map((k) => [k, emptyEvents()]),
    ) as Record<PropertyTypeKey, DashboardEventCounts>;

    const eventCountsByPropertyTypeAndTransaction = Object.fromEntries(
      PROPERTY_TYPE_KEYS.map((k) => [
        k,
        { rent: emptyEvents(), sale: emptyEvents() },
      ]),
    ) as Record<
      PropertyTypeKey,
      { rent: DashboardEventCounts; sale: DashboardEventCounts }
    >;

    const viewsByCityAndTransaction: Record<
      string,
      { sale: number; rent: number }
    > = {};
    const viewsBySectorAndTransaction: Record<
      string,
      { sale: number; rent: number }
    > = {};
    const interactionsByCityAndTransaction: Record<
      string,
      { sale: number; rent: number }
    > = {};
    const interactionsBySectorAndTransaction: Record<
      string,
      { sale: number; rent: number }
    > = {};

    for (const ad of advertisements) {
      const txKey = this.mapTransactionType(ad.transactionType);
      const propKey = this.mapPropertyType(ad.type) as PropertyTypeKey;
      const isActive = ad.status === AdvertisementStatus.ACTIVE;
      const cityKey = this.normalizeLocationKey(ad.address?.city);
      const sectorKey = this.normalizeLocationKey(ad.address?.neighbourhood);

      summary.totalProperties++;
      if (isActive) summary.activeProperties++;

      propertyCountsByTransaction[txKey].properties++;
      if (isActive) propertyCountsByTransaction[txKey].activeProperties++;

      propertyCountsByPropertyType[propKey].properties++;
      if (isActive) propertyCountsByPropertyType[propKey].activeProperties++;

      propertyCountsByPropertyTypeAndTransaction[propKey][txKey]++;

      let views = 0;
      let whatsappClicks = 0;
      let phoneClicks = 0;
      let catalogViews = 0;

      if (ad.advertisementEvents && ad.advertisementEvents.length > 0) {
        for (const event of ad.advertisementEvents) {
          switch (event.type) {
            case 'AD_VIEW':
              views += event.count;
              break;
            case 'AD_PHONE_CLICK':
              whatsappClicks += event.count;
              break;
            case 'AD_CONTACT_CLICK':
              phoneClicks += event.count;
              break;
            case 'AD_PROFILE_VIEW':
              catalogViews += event.count;
              break;
          }
        }
      }

      summary.totalAdViews += views;
      summary.totalAdWhatsappClicks += whatsappClicks;
      summary.totalAdPhoneClicks += phoneClicks;
      summary.totalAdCatalogViews += catalogViews;

      eventCountsByTransaction[txKey].views += views;
      eventCountsByTransaction[txKey].whatsappClicks += whatsappClicks;
      eventCountsByTransaction[txKey].phoneClicks += phoneClicks;
      eventCountsByTransaction[txKey].catalogViews += catalogViews;

      eventCountsByPropertyType[propKey].views += views;
      eventCountsByPropertyType[propKey].whatsappClicks += whatsappClicks;
      eventCountsByPropertyType[propKey].phoneClicks += phoneClicks;
      eventCountsByPropertyType[propKey].catalogViews += catalogViews;

      const ptxBucket = eventCountsByPropertyTypeAndTransaction[propKey][txKey];
      ptxBucket.views += views;
      ptxBucket.whatsappClicks += whatsappClicks;
      ptxBucket.phoneClicks += phoneClicks;
      ptxBucket.catalogViews += catalogViews;

      if (!viewsByCityAndTransaction[cityKey])
        viewsByCityAndTransaction[cityKey] = { sale: 0, rent: 0 };
      viewsByCityAndTransaction[cityKey][txKey] += views;

      if (!viewsBySectorAndTransaction[sectorKey])
        viewsBySectorAndTransaction[sectorKey] = { sale: 0, rent: 0 };
      viewsBySectorAndTransaction[sectorKey][txKey] += views;

      const interactions = whatsappClicks + phoneClicks;

      if (!interactionsByCityAndTransaction[cityKey])
        interactionsByCityAndTransaction[cityKey] = { sale: 0, rent: 0 };
      interactionsByCityAndTransaction[cityKey][txKey] += interactions;

      if (!interactionsBySectorAndTransaction[sectorKey])
        interactionsBySectorAndTransaction[sectorKey] = { sale: 0, rent: 0 };
      interactionsBySectorAndTransaction[sectorKey][txKey] += interactions;
    }

    return {
      summary,
      propertyCountsByTransaction,
      propertyCountsByPropertyType,
      propertyCountsByPropertyTypeAndTransaction,
      eventCountsByTransaction,
      eventCountsByPropertyType,
      eventCountsByPropertyTypeAndTransaction,
      viewsByCityAndTransaction,
      viewsBySectorAndTransaction,
      interactionsByCityAndTransaction,
      interactionsBySectorAndTransaction,
    };
  }

  private buildEmptyAccumulatedDashboard(): AccumulatedDashboard {
    return {
      catalogViews: {
        byTransactionType: { sale: 0, rent: 0 },
        byPropertyType: {
          house: 0,
          apartment: 0,
          lot: 0,
          building: 0,
          warehouse: 0,
          office: 0,
          commercial: 0,
        },
      },
      views: {
        byCityAndTransaction: {},
        bySectorAndTransaction: {},
      },
      interactions: {
        byCityAndTransaction: {},
        bySectorAndTransaction: {},
      },
    };
  }

  private buildAccumulatedDashboard(
    cumulative: CumulativeDashboardSnapshot,
  ): AccumulatedDashboard {
    return {
      catalogViews: {
        byTransactionType: {
          sale: cumulative.eventCountsByTransaction.sale.catalogViews,
          rent: cumulative.eventCountsByTransaction.rent.catalogViews,
        },
        byPropertyType: {
          house: cumulative.eventCountsByPropertyType.house.catalogViews,
          apartment: cumulative.eventCountsByPropertyType.apartment.catalogViews,
          lot: cumulative.eventCountsByPropertyType.lot.catalogViews,
          building: cumulative.eventCountsByPropertyType.building.catalogViews,
          warehouse: cumulative.eventCountsByPropertyType.warehouse.catalogViews,
          office: cumulative.eventCountsByPropertyType.office.catalogViews,
          commercial:
            cumulative.eventCountsByPropertyType.commercial.catalogViews,
        },
      },
      views: {
        byCityAndTransaction: { ...cumulative.viewsByCityAndTransaction },
        bySectorAndTransaction: { ...cumulative.viewsBySectorAndTransaction },
      },
      interactions: {
        byCityAndTransaction: {
          ...cumulative.interactionsByCityAndTransaction,
        },
        bySectorAndTransaction: {
          ...cumulative.interactionsBySectorAndTransaction,
        },
      },
    };
  }

  private buildEmptyDashboard(): DashboardData {
    return new DashboardData({
      summary: new DashboardSummary({
        totalProperties: 0,
        activeProperties: 0,
        totalAdViews: 0,
        totalAdWhatsappClicks: 0,
        totalAdPhoneClicks: 0,
        totalAdCatalogViews: 0,
      }),
      breakdowns: new DashboardBreakdowns({
        byTransactionType: [],
        byPropertyType: [],
        byPropertyTypeAndTransactionType: [],
      }),
      viewsBreakdowns: new DashboardMetricBreakdowns({
        byTransactionType: [],
        byPropertyType: [],
        byPropertyTypeAndTransactionType: [],
        byCities: [],
        bySectors: [],
      }),
      interactionsBreakdowns: new DashboardMetricBreakdowns({
        byTransactionType: [],
        byPropertyType: [],
        byPropertyTypeAndTransactionType: [],
        byCities: [],
        bySectors: [],
      }),
    });
  }

  private buildMetricByOfferTopN(
    current: Record<string, { sale: number; rent: number }>,
    previous: Record<string, { sale: number; rent: number }> | undefined,
  ): DashboardMetricByOfferItem[] {
    const keys = new Set<string>(Object.keys(current));
    if (previous) Object.keys(previous).forEach((k) => keys.add(k));

    const items: DashboardMetricByOfferItem[] = [];
    keys.forEach((key) => {
      const cur = current[key] || { sale: 0, rent: 0 };
      const prev = (previous || {})[key] || { sale: 0, rent: 0 };
      const rentValue = this.diff(cur.rent, prev.rent);
      const saleValue = this.diff(cur.sale, prev.sale);
      if (rentValue + saleValue === 0) return;
      items.push(
        new DashboardMetricByOfferItem({
          key,
          label: this.resolveLocationLabel(key),
          totals: { rentValue, saleValue },
        }),
      );
    });

    items.sort(
      (a, b) =>
        b.totals.rentValue +
        b.totals.saleValue -
        (a.totals.rentValue + a.totals.saleValue),
    );
    return items.slice(0, TOP_N_LOCATIONS);
  }

  private buildDashboardData(
    cumulative: CumulativeDashboardSnapshot,
    previousAccumulated:
      | AccountAdvertisementStatistics['accumulatedMetrics']
      | null
      | undefined,
  ): DashboardData {
    const prevDashboard = previousAccumulated?.dashboard;
    const prevVisits = previousAccumulated?.totalVisits;
    const prevWhatsapp = previousAccumulated?.phoneClicks;
    const prevPhone = previousAccumulated?.contactInfoClicks;
    const prevCatalogTotal = previousAccumulated?.digitalCatalogViews || 0;

    const prevVisitsTx = (tx: 'sale' | 'rent') =>
      prevVisits?.byTransactionType?.[tx] || 0;
    const prevWhatsappTx = (tx: 'sale' | 'rent') =>
      prevWhatsapp?.byTransactionType?.[tx] || 0;
    const prevPhoneTx = (tx: 'sale' | 'rent') =>
      prevPhone?.byTransactionType?.[tx] || 0;
    const prevCatalogTx = (tx: 'sale' | 'rent') =>
      prevDashboard?.catalogViews?.byTransactionType?.[tx] || 0;

    const prevVisitsProp = (k: PropertyTypeKey) => {
      const n = prevVisits?.byPropertyTypeAndTransaction?.[k];
      return (n?.sale || 0) + (n?.rent || 0);
    };
    const prevWhatsappProp = (k: PropertyTypeKey) => {
      const n = prevWhatsapp?.byPropertyTypeAndTransaction?.[k];
      return (n?.sale || 0) + (n?.rent || 0);
    };
    const prevPhoneProp = (k: PropertyTypeKey) => {
      const n = prevPhone?.byPropertyTypeAndTransaction?.[k];
      return (n?.sale || 0) + (n?.rent || 0);
    };
    const prevCatalogProp = (k: PropertyTypeKey) =>
      prevDashboard?.catalogViews?.byPropertyType?.[k] || 0;

    const prevVisitsPropTx = (k: PropertyTypeKey, tx: 'sale' | 'rent') =>
      prevVisits?.byPropertyTypeAndTransaction?.[k]?.[tx] || 0;
    const prevWhatsappPropTx = (k: PropertyTypeKey, tx: 'sale' | 'rent') =>
      prevWhatsapp?.byPropertyTypeAndTransaction?.[k]?.[tx] || 0;
    const prevPhonePropTx = (k: PropertyTypeKey, tx: 'sale' | 'rent') =>
      prevPhone?.byPropertyTypeAndTransaction?.[k]?.[tx] || 0;

    const summary = new DashboardSummary({
      totalProperties: cumulative.summary.totalProperties,
      activeProperties: cumulative.summary.activeProperties,
      totalAdViews: this.diff(
        cumulative.summary.totalAdViews,
        prevVisits?.total || 0,
      ),
      totalAdWhatsappClicks: this.diff(
        cumulative.summary.totalAdWhatsappClicks,
        prevWhatsapp?.total || 0,
      ),
      totalAdPhoneClicks: this.diff(
        cumulative.summary.totalAdPhoneClicks,
        prevPhone?.total || 0,
      ),
      totalAdCatalogViews: this.diff(
        cumulative.summary.totalAdCatalogViews,
        prevCatalogTotal,
      ),
    });

    const txOrdered: Array<'RENT' | 'SALE'> = ['RENT', 'SALE'];

    const breakdownByTransactionType: DashboardBreakdownItem[] = txOrdered.map(
      (txUpper) => {
        const tx: 'sale' | 'rent' = txUpper === 'RENT' ? 'rent' : 'sale';
        const counts = cumulative.propertyCountsByTransaction[tx];
        const ev = cumulative.eventCountsByTransaction[tx];
        return new DashboardBreakdownItem({
          key: txUpper,
          label: TRANSACTION_TYPE_LABELS[txUpper],
          totals: {
            properties: counts.properties,
            activeProperties: counts.activeProperties,
            views: this.diff(ev.views, prevVisitsTx(tx)),
            whatsappClicks: this.diff(
              ev.whatsappClicks,
              prevWhatsappTx(tx),
            ),
            phoneClicks: this.diff(ev.phoneClicks, prevPhoneTx(tx)),
            catalogViews: this.diff(ev.catalogViews, prevCatalogTx(tx)),
          },
        });
      },
    );

    const breakdownByPropertyType: DashboardBreakdownItem[] =
      PROPERTY_TYPE_KEYS.map((k) => {
        const counts = cumulative.propertyCountsByPropertyType[k];
        const ev = cumulative.eventCountsByPropertyType[k];
        const keyUpper = PROPERTY_TYPE_UPPER[k];
        return new DashboardBreakdownItem({
          key: keyUpper,
          label: PROPERTY_TYPE_LABELS[keyUpper],
          totals: {
            properties: counts.properties,
            activeProperties: counts.activeProperties,
            views: this.diff(ev.views, prevVisitsProp(k)),
            whatsappClicks: this.diff(ev.whatsappClicks, prevWhatsappProp(k)),
            phoneClicks: this.diff(ev.phoneClicks, prevPhoneProp(k)),
            catalogViews: this.diff(ev.catalogViews, prevCatalogProp(k)),
          },
        });
      });

    const breakdownByPropertyTypeAndTransactionType: DashboardPropertyTypeByOfferItem[] =
      PROPERTY_TYPE_KEYS.map((k) => {
        const counts = cumulative.propertyCountsByPropertyTypeAndTransaction[k];
        const keyUpper = PROPERTY_TYPE_UPPER[k];
        return new DashboardPropertyTypeByOfferItem({
          key: keyUpper,
          label: PROPERTY_TYPE_LABELS[keyUpper],
          totals: {
            rentProperties: counts.rent,
            saleProperties: counts.sale,
          },
        });
      });

    const viewsByTransactionType: DashboardMetricItem[] = txOrdered.map(
      (txUpper) => {
        const tx: 'sale' | 'rent' = txUpper === 'RENT' ? 'rent' : 'sale';
        return new DashboardMetricItem({
          key: txUpper,
          label: TRANSACTION_TYPE_LABELS[txUpper],
          totals: {
            value: this.diff(
              cumulative.eventCountsByTransaction[tx].views,
              prevVisitsTx(tx),
            ),
          },
        });
      },
    );

    const viewsByPropertyType: DashboardMetricItem[] = PROPERTY_TYPE_KEYS.map(
      (k) => {
        const keyUpper = PROPERTY_TYPE_UPPER[k];
        return new DashboardMetricItem({
          key: keyUpper,
          label: PROPERTY_TYPE_LABELS[keyUpper],
          totals: {
            value: this.diff(
              cumulative.eventCountsByPropertyType[k].views,
              prevVisitsProp(k),
            ),
          },
        });
      },
    );

    const viewsByPropertyTypeAndTransactionType: DashboardMetricByOfferItem[] =
      PROPERTY_TYPE_KEYS.map((k) => {
        const keyUpper = PROPERTY_TYPE_UPPER[k];
        const bucket = cumulative.eventCountsByPropertyTypeAndTransaction[k];
        return new DashboardMetricByOfferItem({
          key: keyUpper,
          label: PROPERTY_TYPE_LABELS[keyUpper],
          totals: {
            rentValue: this.diff(
              bucket.rent.views,
              prevVisitsPropTx(k, 'rent'),
            ),
            saleValue: this.diff(
              bucket.sale.views,
              prevVisitsPropTx(k, 'sale'),
            ),
          },
        });
      });

    const viewsByCities = this.buildMetricByOfferTopN(
      cumulative.viewsByCityAndTransaction,
      prevDashboard?.views?.byCityAndTransaction,
    );
    const viewsBySectors = this.buildMetricByOfferTopN(
      cumulative.viewsBySectorAndTransaction,
      prevDashboard?.views?.bySectorAndTransaction,
    );

    const interactionsByTransactionType: DashboardMetricItem[] = txOrdered.map(
      (txUpper) => {
        const tx: 'sale' | 'rent' = txUpper === 'RENT' ? 'rent' : 'sale';
        const ev = cumulative.eventCountsByTransaction[tx];
        const monthlyW = this.diff(ev.whatsappClicks, prevWhatsappTx(tx));
        const monthlyP = this.diff(ev.phoneClicks, prevPhoneTx(tx));
        return new DashboardMetricItem({
          key: txUpper,
          label: TRANSACTION_TYPE_LABELS[txUpper],
          totals: { value: monthlyW + monthlyP },
        });
      },
    );

    const interactionsByPropertyType: DashboardMetricItem[] =
      PROPERTY_TYPE_KEYS.map((k) => {
        const keyUpper = PROPERTY_TYPE_UPPER[k];
        const ev = cumulative.eventCountsByPropertyType[k];
        const monthlyW = this.diff(ev.whatsappClicks, prevWhatsappProp(k));
        const monthlyP = this.diff(ev.phoneClicks, prevPhoneProp(k));
        return new DashboardMetricItem({
          key: keyUpper,
          label: PROPERTY_TYPE_LABELS[keyUpper],
          totals: { value: monthlyW + monthlyP },
        });
      });

    const interactionsByPropertyTypeAndTransactionType: DashboardMetricByOfferItem[] =
      PROPERTY_TYPE_KEYS.map((k) => {
        const keyUpper = PROPERTY_TYPE_UPPER[k];
        const bucket = cumulative.eventCountsByPropertyTypeAndTransaction[k];
        const rentMonthlyW = this.diff(
          bucket.rent.whatsappClicks,
          prevWhatsappPropTx(k, 'rent'),
        );
        const rentMonthlyP = this.diff(
          bucket.rent.phoneClicks,
          prevPhonePropTx(k, 'rent'),
        );
        const saleMonthlyW = this.diff(
          bucket.sale.whatsappClicks,
          prevWhatsappPropTx(k, 'sale'),
        );
        const saleMonthlyP = this.diff(
          bucket.sale.phoneClicks,
          prevPhonePropTx(k, 'sale'),
        );
        return new DashboardMetricByOfferItem({
          key: keyUpper,
          label: PROPERTY_TYPE_LABELS[keyUpper],
          totals: {
            rentValue: rentMonthlyW + rentMonthlyP,
            saleValue: saleMonthlyW + saleMonthlyP,
          },
        });
      });

    const interactionsByCities = this.buildMetricByOfferTopN(
      cumulative.interactionsByCityAndTransaction,
      prevDashboard?.interactions?.byCityAndTransaction,
    );
    const interactionsBySectors = this.buildMetricByOfferTopN(
      cumulative.interactionsBySectorAndTransaction,
      prevDashboard?.interactions?.bySectorAndTransaction,
    );

    return new DashboardData({
      summary,
      breakdowns: new DashboardBreakdowns({
        byTransactionType: breakdownByTransactionType,
        byPropertyType: breakdownByPropertyType,
        byPropertyTypeAndTransactionType:
          breakdownByPropertyTypeAndTransactionType,
      }),
      viewsBreakdowns: new DashboardMetricBreakdowns({
        byTransactionType: viewsByTransactionType,
        byPropertyType: viewsByPropertyType,
        byPropertyTypeAndTransactionType:
          viewsByPropertyTypeAndTransactionType,
        byCities: viewsByCities,
        bySectors: viewsBySectors,
      }),
      interactionsBreakdowns: new DashboardMetricBreakdowns({
        byTransactionType: interactionsByTransactionType,
        byPropertyType: interactionsByPropertyType,
        byPropertyTypeAndTransactionType:
          interactionsByPropertyTypeAndTransactionType,
        byCities: interactionsByCities,
        bySectors: interactionsBySectors,
      }),
    });
  }
}
