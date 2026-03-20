import { AccountAdvertisementStatistics } from 'src/domain/entities/account-advertisement-statistics';
import { AccountAdvertisementStatistics as AccountAdvertisementStatisticsDocument } from '../entities/account-advertisement-statistics.entity';
import * as mongoose from 'mongoose';

export class MongooseAccountAdvertisementStatisticsMapper {
  static toDomain(
    entity: AccountAdvertisementStatisticsDocument,
  ): AccountAdvertisementStatistics {
    if (!entity) return null;

    const model = new AccountAdvertisementStatistics({
      id: entity._id.toString(),
      accountId: entity.accountId?.toString(),
      month: entity.month,
      createdAt: entity.createdAt,
      totalAdvertisements: entity.totalAdvertisements,
      totalVisits: entity.totalVisits,
      phoneClicks: entity.phoneClicks,
      digitalCatalogViews: entity.digitalCatalogViews,
      contactInfoClicks: entity.contactInfoClicks,
      topViewedAdvertisements: entity.topViewedAdvertisements,
      topInteractedAdvertisements: entity.topInteractedAdvertisements,
      accumulatedMetrics: entity.accumulatedMetrics
        ? {
            totalVisits: {
              ...entity.accumulatedMetrics.totalVisits,
              byPropertyTypeAndTransaction: {
                house: entity.accumulatedMetrics.totalVisits
                  ?.byPropertyTypeAndTransaction?.house || { sale: 0, rent: 0 },
                apartment: entity.accumulatedMetrics.totalVisits
                  ?.byPropertyTypeAndTransaction?.apartment || {
                  sale: 0,
                  rent: 0,
                },
                lot: entity.accumulatedMetrics.totalVisits
                  ?.byPropertyTypeAndTransaction?.lot || { sale: 0, rent: 0 },
                building: entity.accumulatedMetrics.totalVisits
                  ?.byPropertyTypeAndTransaction?.building || {
                  sale: 0,
                  rent: 0,
                },
                warehouse: entity.accumulatedMetrics.totalVisits
                  ?.byPropertyTypeAndTransaction?.warehouse || {
                  sale: 0,
                  rent: 0,
                },
                office: entity.accumulatedMetrics.totalVisits
                  ?.byPropertyTypeAndTransaction?.office || {
                  sale: 0,
                  rent: 0,
                },
                commercial: entity.accumulatedMetrics.totalVisits
                  ?.byPropertyTypeAndTransaction?.commercial || {
                  sale: 0,
                  rent: 0,
                },
              },
            },
            phoneClicks: {
              ...entity.accumulatedMetrics.phoneClicks,
              byPropertyTypeAndTransaction: {
                house: entity.accumulatedMetrics.phoneClicks
                  ?.byPropertyTypeAndTransaction?.house || { sale: 0, rent: 0 },
                apartment: entity.accumulatedMetrics.phoneClicks
                  ?.byPropertyTypeAndTransaction?.apartment || {
                  sale: 0,
                  rent: 0,
                },
                lot: entity.accumulatedMetrics.phoneClicks
                  ?.byPropertyTypeAndTransaction?.lot || { sale: 0, rent: 0 },
                building: entity.accumulatedMetrics.phoneClicks
                  ?.byPropertyTypeAndTransaction?.building || {
                  sale: 0,
                  rent: 0,
                },
                warehouse: entity.accumulatedMetrics.phoneClicks
                  ?.byPropertyTypeAndTransaction?.warehouse || {
                  sale: 0,
                  rent: 0,
                },
                office: entity.accumulatedMetrics.phoneClicks
                  ?.byPropertyTypeAndTransaction?.office || {
                  sale: 0,
                  rent: 0,
                },
                commercial: entity.accumulatedMetrics.phoneClicks
                  ?.byPropertyTypeAndTransaction?.commercial || {
                  sale: 0,
                  rent: 0,
                },
              },
            },
            digitalCatalogViews:
              entity.accumulatedMetrics.digitalCatalogViews || 0,
            contactInfoClicks: {
              ...entity.accumulatedMetrics.contactInfoClicks,
              byPropertyTypeAndTransaction: {
                house: entity.accumulatedMetrics.contactInfoClicks
                  ?.byPropertyTypeAndTransaction?.house || { sale: 0, rent: 0 },
                apartment: entity.accumulatedMetrics.contactInfoClicks
                  ?.byPropertyTypeAndTransaction?.apartment || {
                  sale: 0,
                  rent: 0,
                },
                lot: entity.accumulatedMetrics.contactInfoClicks
                  ?.byPropertyTypeAndTransaction?.lot || { sale: 0, rent: 0 },
                building: entity.accumulatedMetrics.contactInfoClicks
                  ?.byPropertyTypeAndTransaction?.building || {
                  sale: 0,
                  rent: 0,
                },
                warehouse: entity.accumulatedMetrics.contactInfoClicks
                  ?.byPropertyTypeAndTransaction?.warehouse || {
                  sale: 0,
                  rent: 0,
                },
                office: entity.accumulatedMetrics.contactInfoClicks
                  ?.byPropertyTypeAndTransaction?.office || {
                  sale: 0,
                  rent: 0,
                },
                commercial: entity.accumulatedMetrics.contactInfoClicks
                  ?.byPropertyTypeAndTransaction?.commercial || {
                  sale: 0,
                  rent: 0,
                },
              },
            },
          }
        : undefined,
    });

    return model;
  }

  static toMongoose(statistics: AccountAdvertisementStatistics) {
    return {
      accountId: statistics.accountId,
      month: statistics.month,
      createdAt: statistics.createdAt,
      totalAdvertisements: {
        total: statistics.totalAdvertisements?.total,
        byTransactionType: {
          sale: statistics.totalAdvertisements?.byTransactionType?.sale,
          rent: statistics.totalAdvertisements?.byTransactionType?.rent,
        },
        byPropertyTypeAndTransaction: {
          house: {
            sale: statistics.totalAdvertisements?.byPropertyTypeAndTransaction
              ?.house?.sale,
            rent: statistics.totalAdvertisements?.byPropertyTypeAndTransaction
              ?.house?.rent,
          },
          apartment: {
            sale: statistics.totalAdvertisements?.byPropertyTypeAndTransaction
              ?.apartment?.sale,
            rent: statistics.totalAdvertisements?.byPropertyTypeAndTransaction
              ?.apartment?.rent,
          },
          lot: {
            sale: statistics.totalAdvertisements?.byPropertyTypeAndTransaction
              ?.lot?.sale,
            rent: statistics.totalAdvertisements?.byPropertyTypeAndTransaction
              ?.lot?.rent,
          },
          building: {
            sale: statistics.totalAdvertisements?.byPropertyTypeAndTransaction
              ?.building?.sale,
            rent: statistics.totalAdvertisements?.byPropertyTypeAndTransaction
              ?.building?.rent,
          },
          warehouse: {
            sale: statistics.totalAdvertisements?.byPropertyTypeAndTransaction
              ?.warehouse?.sale,
            rent: statistics.totalAdvertisements?.byPropertyTypeAndTransaction
              ?.warehouse?.rent,
          },
          office: {
            sale: statistics.totalAdvertisements?.byPropertyTypeAndTransaction
              ?.office?.sale,
            rent: statistics.totalAdvertisements?.byPropertyTypeAndTransaction
              ?.office?.rent,
          },
          commercial: {
            sale: statistics.totalAdvertisements?.byPropertyTypeAndTransaction
              ?.commercial?.sale,
            rent: statistics.totalAdvertisements?.byPropertyTypeAndTransaction
              ?.commercial?.rent,
          },
        },
      },
      totalVisits: {
        total: statistics.totalVisits?.total,
        byTransactionType: {
          sale: statistics.totalVisits?.byTransactionType?.sale,
          rent: statistics.totalVisits?.byTransactionType?.rent,
        },
        byPropertyTypeAndTransaction: {
          house: {
            sale: statistics.totalVisits?.byPropertyTypeAndTransaction?.house
              ?.sale,
            rent: statistics.totalVisits?.byPropertyTypeAndTransaction?.house
              ?.rent,
          },
          apartment: {
            sale: statistics.totalVisits?.byPropertyTypeAndTransaction
              ?.apartment?.sale,
            rent: statistics.totalVisits?.byPropertyTypeAndTransaction
              ?.apartment?.rent,
          },
          lot: {
            sale: statistics.totalVisits?.byPropertyTypeAndTransaction?.lot
              ?.sale,
            rent: statistics.totalVisits?.byPropertyTypeAndTransaction?.lot
              ?.rent,
          },
          building: {
            sale: statistics.totalVisits?.byPropertyTypeAndTransaction?.building
              ?.sale,
            rent: statistics.totalVisits?.byPropertyTypeAndTransaction?.building
              ?.rent,
          },
          warehouse: {
            sale: statistics.totalVisits?.byPropertyTypeAndTransaction
              ?.warehouse?.sale,
            rent: statistics.totalVisits?.byPropertyTypeAndTransaction
              ?.warehouse?.rent,
          },
          office: {
            sale: statistics.totalVisits?.byPropertyTypeAndTransaction?.office
              ?.sale,
            rent: statistics.totalVisits?.byPropertyTypeAndTransaction?.office
              ?.rent,
          },
          commercial: {
            sale: statistics.totalVisits?.byPropertyTypeAndTransaction
              ?.commercial?.sale,
            rent: statistics.totalVisits?.byPropertyTypeAndTransaction
              ?.commercial?.rent,
          },
        },
      },
      phoneClicks: {
        total: statistics.phoneClicks?.total,
        byTransactionType: {
          sale: statistics.phoneClicks?.byTransactionType?.sale,
          rent: statistics.phoneClicks?.byTransactionType?.rent,
        },
        byPropertyTypeAndTransaction: {
          house: {
            sale: statistics.phoneClicks?.byPropertyTypeAndTransaction?.house
              ?.sale,
            rent: statistics.phoneClicks?.byPropertyTypeAndTransaction?.house
              ?.rent,
          },
          apartment: {
            sale: statistics.phoneClicks?.byPropertyTypeAndTransaction
              ?.apartment?.sale,
            rent: statistics.phoneClicks?.byPropertyTypeAndTransaction
              ?.apartment?.rent,
          },
          lot: {
            sale: statistics.phoneClicks?.byPropertyTypeAndTransaction?.lot
              ?.sale,
            rent: statistics.phoneClicks?.byPropertyTypeAndTransaction?.lot
              ?.rent,
          },
          building: {
            sale: statistics.phoneClicks?.byPropertyTypeAndTransaction?.building
              ?.sale,
            rent: statistics.phoneClicks?.byPropertyTypeAndTransaction?.building
              ?.rent,
          },
          warehouse: {
            sale: statistics.phoneClicks?.byPropertyTypeAndTransaction
              ?.warehouse?.sale,
            rent: statistics.phoneClicks?.byPropertyTypeAndTransaction
              ?.warehouse?.rent,
          },
          office: {
            sale: statistics.phoneClicks?.byPropertyTypeAndTransaction?.office
              ?.sale,
            rent: statistics.phoneClicks?.byPropertyTypeAndTransaction?.office
              ?.rent,
          },
          commercial: {
            sale: statistics.phoneClicks?.byPropertyTypeAndTransaction
              ?.commercial?.sale,
            rent: statistics.phoneClicks?.byPropertyTypeAndTransaction
              ?.commercial?.rent,
          },
        },
      },
      digitalCatalogViews: statistics.digitalCatalogViews,
      contactInfoClicks: {
        total: statistics.contactInfoClicks?.total,
        byTransactionType: {
          sale: statistics.contactInfoClicks?.byTransactionType?.sale,
          rent: statistics.contactInfoClicks?.byTransactionType?.rent,
        },
        byPropertyTypeAndTransaction: {
          house: {
            sale: statistics.contactInfoClicks?.byPropertyTypeAndTransaction
              ?.house?.sale,
            rent: statistics.contactInfoClicks?.byPropertyTypeAndTransaction
              ?.house?.rent,
          },
          apartment: {
            sale: statistics.contactInfoClicks?.byPropertyTypeAndTransaction
              ?.apartment?.sale,
            rent: statistics.contactInfoClicks?.byPropertyTypeAndTransaction
              ?.apartment?.rent,
          },
          lot: {
            sale: statistics.contactInfoClicks?.byPropertyTypeAndTransaction
              ?.lot?.sale,
            rent: statistics.contactInfoClicks?.byPropertyTypeAndTransaction
              ?.lot?.rent,
          },
          building: {
            sale: statistics.contactInfoClicks?.byPropertyTypeAndTransaction
              ?.building?.sale,
            rent: statistics.contactInfoClicks?.byPropertyTypeAndTransaction
              ?.building?.rent,
          },
          warehouse: {
            sale: statistics.contactInfoClicks?.byPropertyTypeAndTransaction
              ?.warehouse?.sale,
            rent: statistics.contactInfoClicks?.byPropertyTypeAndTransaction
              ?.warehouse?.rent,
          },
          office: {
            sale: statistics.contactInfoClicks?.byPropertyTypeAndTransaction
              ?.office?.sale,
            rent: statistics.contactInfoClicks?.byPropertyTypeAndTransaction
              ?.office?.rent,
          },
          commercial: {
            sale: statistics.contactInfoClicks?.byPropertyTypeAndTransaction
              ?.commercial?.sale,
            rent: statistics.contactInfoClicks?.byPropertyTypeAndTransaction
              ?.commercial?.rent,
          },
        },
      },
      topViewedAdvertisements: {
        sale: statistics.topViewedAdvertisements?.sale?.map((item) => ({
          advertisementId: item.advertisementId,
          views: item.views,
        })),
        rent: statistics.topViewedAdvertisements?.rent?.map((item) => ({
          advertisementId: item.advertisementId,
          views: item.views,
        })),
      },
      topInteractedAdvertisements: {
        sale: statistics.topInteractedAdvertisements?.sale?.map((item) => ({
          advertisementId: item.advertisementId,
          interactions: item.interactions,
        })),
        rent: statistics.topInteractedAdvertisements?.rent?.map((item) => ({
          advertisementId: item.advertisementId,
          interactions: item.interactions,
        })),
      },
      accumulatedMetrics: statistics.accumulatedMetrics
        ? {
            totalVisits: statistics.accumulatedMetrics.totalVisits,
            phoneClicks: statistics.accumulatedMetrics.phoneClicks,
            digitalCatalogViews:
              statistics.accumulatedMetrics.digitalCatalogViews,
            contactInfoClicks: statistics.accumulatedMetrics.contactInfoClicks,
          }
        : undefined,
    };
  }
}
