import { AdvertisementStatistics } from 'src/domain/entities/advertisement-statistics';
import { AdvertisementStatistics as AdvertisementStatisticsDocument } from '../entities/advertisement-statistics.entity';
import * as mongoose from 'mongoose';

export class MongooseAdvertisementStatisticsMapper {
    
    static toDomain(entity: AdvertisementStatisticsDocument): AdvertisementStatistics {
        if (!entity) return null;
        
        const model = new AdvertisementStatistics({
            id: entity._id.toString(),
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

    static toMongoose(statistics: AdvertisementStatistics) {
        return {
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
                totalVisits: {
                    total: statistics.accumulatedMetrics.totalVisits?.total || 0,
                    byTransactionType: {
                        sale: statistics.accumulatedMetrics.totalVisits?.byTransactionType?.sale || 0,
                        rent: statistics.accumulatedMetrics.totalVisits?.byTransactionType?.rent || 0
                    },
                    byPropertyTypeAndTransaction: {
                        house: {
                            sale: statistics.accumulatedMetrics.totalVisits?.byPropertyTypeAndTransaction?.house?.sale || 0,
                            rent: statistics.accumulatedMetrics.totalVisits?.byPropertyTypeAndTransaction?.house?.rent || 0
                        },
                        apartment: {
                            sale: statistics.accumulatedMetrics.totalVisits?.byPropertyTypeAndTransaction?.apartment?.sale || 0,
                            rent: statistics.accumulatedMetrics.totalVisits?.byPropertyTypeAndTransaction?.apartment?.rent || 0
                        },
                        lot: {
                            sale: statistics.accumulatedMetrics.totalVisits?.byPropertyTypeAndTransaction?.lot?.sale || 0,
                            rent: statistics.accumulatedMetrics.totalVisits?.byPropertyTypeAndTransaction?.lot?.rent || 0
                        }
                    }
                },
                phoneClicks: {
                    total: statistics.accumulatedMetrics.phoneClicks?.total || 0,
                    byTransactionType: {
                        sale: statistics.accumulatedMetrics.phoneClicks?.byTransactionType?.sale || 0,
                        rent: statistics.accumulatedMetrics.phoneClicks?.byTransactionType?.rent || 0
                    },
                    byPropertyTypeAndTransaction: {
                        house: {
                            sale: statistics.accumulatedMetrics.phoneClicks?.byPropertyTypeAndTransaction?.house?.sale || 0,
                            rent: statistics.accumulatedMetrics.phoneClicks?.byPropertyTypeAndTransaction?.house?.rent || 0
                        },
                        apartment: {
                            sale: statistics.accumulatedMetrics.phoneClicks?.byPropertyTypeAndTransaction?.apartment?.sale || 0,
                            rent: statistics.accumulatedMetrics.phoneClicks?.byPropertyTypeAndTransaction?.apartment?.rent || 0
                        },
                        lot: {
                            sale: statistics.accumulatedMetrics.phoneClicks?.byPropertyTypeAndTransaction?.lot?.sale || 0,
                            rent: statistics.accumulatedMetrics.phoneClicks?.byPropertyTypeAndTransaction?.lot?.rent || 0
                        }
                    }
                },
                digitalCatalogViews: statistics.accumulatedMetrics.digitalCatalogViews || 0,
                contactInfoClicks: {
                    total: statistics.accumulatedMetrics.contactInfoClicks?.total || 0,
                    byTransactionType: {
                        sale: statistics.accumulatedMetrics.contactInfoClicks?.byTransactionType?.sale || 0,
                        rent: statistics.accumulatedMetrics.contactInfoClicks?.byTransactionType?.rent || 0
                    },
                    byPropertyTypeAndTransaction: {
                        house: {
                            sale: statistics.accumulatedMetrics.contactInfoClicks?.byPropertyTypeAndTransaction?.house?.sale || 0,
                            rent: statistics.accumulatedMetrics.contactInfoClicks?.byPropertyTypeAndTransaction?.house?.rent || 0
                        },
                        apartment: {
                            sale: statistics.accumulatedMetrics.contactInfoClicks?.byPropertyTypeAndTransaction?.apartment?.sale || 0,
                            rent: statistics.accumulatedMetrics.contactInfoClicks?.byPropertyTypeAndTransaction?.apartment?.rent || 0
                        },
                        lot: {
                            sale: statistics.accumulatedMetrics.contactInfoClicks?.byPropertyTypeAndTransaction?.lot?.sale || 0,
                            rent: statistics.accumulatedMetrics.contactInfoClicks?.byPropertyTypeAndTransaction?.lot?.rent || 0
                        }
                    }
                }
            } : null
        };
    }
}
