import { Advertisement, AdvertisementPhoto, AdvertisementStatus, AdvertisementTransactionType, AdvertisementType } from "src/domain/entities/advertisement";

export abstract class IAdvertisementRepository {
    abstract create(data: any): Promise<Advertisement>
    abstract update(advertisementId: string, accountId: string, update: any): Promise<Advertisement>
    abstract findOneById(id: string): Promise<Advertisement>
    abstract findForBulk(accountId: string, lastUpdatedAt: Date): Promise<any[]>
    abstract findByAccountIdWithEvents(accountId: string, page: number, limit: number, code: number, transactionType: AdvertisementTransactionType, type: AdvertisementType, externalId: string): Promise<{ data: Advertisement[]; count: number }>
    abstract findOneActive(advertisementId: string): Promise<Advertisement>
    abstract findToApprove(): Promise<Advertisement[]>
    abstract updateStatus(ids: string[], accountId: string, status: AdvertisementStatus, publishedAt: Date, approvingUserId: string): Promise<any>
    abstract updatePhotos(accountId: string, advertisementId: string, photos: AdvertisementPhoto[]): Promise<Advertisement>
    abstract createPhotos(accountId: string, advertisementId: string, photos: AdvertisementPhoto[]): Promise<Advertisement>
    abstract findByIdsAndAccountId(ids: string[], accountId: string): Promise<Advertisement[]>
    abstract deleteMany(ids: string[], accountId: string): Promise<void>
    abstract getRegisteredAdvertisements(period: 'week' | 'month'): Promise<any[]>
    abstract findSimilarDocuments(embedding: number[]): Promise<any[]>
    abstract findWithReports(): Promise<Advertisement[]>
    abstract transfer(userId: string, accountIdFrom: string, accountIdTo: string): Promise<any>
}