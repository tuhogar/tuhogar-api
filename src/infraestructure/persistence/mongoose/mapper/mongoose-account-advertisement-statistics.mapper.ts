import { AccountAdvertisementStatistics } from 'src/domain/entities/account-advertisement-statistics';
import { AccountAdvertisementStatistics as AccountAdvertisementStatisticsDocument } from '../entities/account-advertisement-statistics.entity';
import * as mongoose from 'mongoose';

export class MongooseAccountAdvertisementStatisticsMapper {
    
    static toDomain(entity: AccountAdvertisementStatisticsDocument): AccountAdvertisementStatistics {
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
                    rent: statistics.totalAdvertisements?.byTransactionType?.rent
                },
                byPropertyTypeAndTransaction: {
                    house: {
                        sale: statistics.totalAdvertisements?.byPropertyTypeAndTransaction?.house?.sale,
                        rent: statistics.totalAdvertisements?.byPropertyTypeAndTransaction?.house?.rent
                    },
                    apartment: {
                        sale: statistics.totalAdvertisements?.byPropertyTypeAndTransaction?.apartment?.sale,
                        rent: statistics.totalAdvertisements?.byPropertyTypeAndTransaction?.apartment?.rent
                    },
                    lot: {
                        sale: statistics.totalAdvertisements?.byPropertyTypeAndTransaction?.lot?.sale,
                        rent: statistics.totalAdvertisements?.byPropertyTypeAndTransaction?.lot?.rent
                    }
                }
            },
            totalVisits: {
                total: statistics.totalVisits?.total,
                byTransactionType: {
                    sale: statistics.totalVisits?.byTransactionType?.sale,
                    rent: statistics.totalVisits?.byTransactionType?.rent
                },
                byPropertyTypeAndTransaction: {
                    house: {
                        sale: statistics.totalVisits?.byPropertyTypeAndTransaction?.house?.sale,
                        rent: statistics.totalVisits?.byPropertyTypeAndTransaction?.house?.rent
                    },
                    apartment: {
                        sale: statistics.totalVisits?.byPropertyTypeAndTransaction?.apartment?.sale,
                        rent: statistics.totalVisits?.byPropertyTypeAndTransaction?.apartment?.rent
                    },
                    lot: {
                        sale: statistics.totalVisits?.byPropertyTypeAndTransaction?.lot?.sale,
                        rent: statistics.totalVisits?.byPropertyTypeAndTransaction?.lot?.rent
                    }
                }
            },
            phoneClicks: {
                total: statistics.phoneClicks?.total,
                byTransactionType: {
                    sale: statistics.phoneClicks?.byTransactionType?.sale,
                    rent: statistics.phoneClicks?.byTransactionType?.rent
                },
                byPropertyTypeAndTransaction: {
                    house: {
                        sale: statistics.phoneClicks?.byPropertyTypeAndTransaction?.house?.sale,
                        rent: statistics.phoneClicks?.byPropertyTypeAndTransaction?.house?.rent
                    },
                    apartment: {
                        sale: statistics.phoneClicks?.byPropertyTypeAndTransaction?.apartment?.sale,
                        rent: statistics.phoneClicks?.byPropertyTypeAndTransaction?.apartment?.rent
                    },
                    lot: {
                        sale: statistics.phoneClicks?.byPropertyTypeAndTransaction?.lot?.sale,
                        rent: statistics.phoneClicks?.byPropertyTypeAndTransaction?.lot?.rent
                    }
                }
            },
            digitalCatalogViews: statistics.digitalCatalogViews,
            contactInfoClicks: {
                total: statistics.contactInfoClicks?.total,
                byTransactionType: {
                    sale: statistics.contactInfoClicks?.byTransactionType?.sale,
                    rent: statistics.contactInfoClicks?.byTransactionType?.rent
                },
                byPropertyTypeAndTransaction: {
                    house: {
                        sale: statistics.contactInfoClicks?.byPropertyTypeAndTransaction?.house?.sale,
                        rent: statistics.contactInfoClicks?.byPropertyTypeAndTransaction?.house?.rent
                    },
                    apartment: {
                        sale: statistics.contactInfoClicks?.byPropertyTypeAndTransaction?.apartment?.sale,
                        rent: statistics.contactInfoClicks?.byPropertyTypeAndTransaction?.apartment?.rent
                    },
                    lot: {
                        sale: statistics.contactInfoClicks?.byPropertyTypeAndTransaction?.lot?.sale,
                        rent: statistics.contactInfoClicks?.byPropertyTypeAndTransaction?.lot?.rent
                    }
                }
            },
            topViewedAdvertisements: {
                sale: statistics.topViewedAdvertisements?.sale?.map(item => ({
                    advertisementId: item.advertisementId,
                    views: item.views
                })),
                rent: statistics.topViewedAdvertisements?.rent?.map(item => ({
                    advertisementId: item.advertisementId,
                    views: item.views
                }))
            },
            topInteractedAdvertisements: {
                sale: statistics.topInteractedAdvertisements?.sale?.map(item => ({
                    advertisementId: item.advertisementId,
                    interactions: item.interactions
                })),
                rent: statistics.topInteractedAdvertisements?.rent?.map(item => ({
                    advertisementId: item.advertisementId,
                    interactions: item.interactions
                }))
            },
            accumulatedMetrics: statistics.accumulatedMetrics ? {
                totalVisits: statistics.accumulatedMetrics.totalVisits,
                phoneClicks: statistics.accumulatedMetrics.phoneClicks,
                digitalCatalogViews: statistics.accumulatedMetrics.digitalCatalogViews,
                contactInfoClicks: statistics.accumulatedMetrics.contactInfoClicks
            } : undefined
        };
    }
}
