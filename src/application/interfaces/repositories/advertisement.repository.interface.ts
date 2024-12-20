import { Advertisement, AdvertisementActivesOrderBy, AdvertisementPhoto, AdvertisementStatus } from "src/domain/entities/advertisement";
import { AuthenticatedUser } from "src/domain/entities/authenticated-user";
import { CreateUpdateAdvertisementDto } from "src/infraestructure/http/dtos/advertisement/create-update-advertisement.dto";
import { UpdateStatusAdvertisementDto } from "src/infraestructure/http/dtos/advertisement/update-status-advertisement.dto";
import { UpdateStatusAllAdvertisementsDto } from "src/infraestructure/http/dtos/advertisement/update-status-all-advertisement.dto";

export abstract class IAdvertisementRepository {
    abstract create(data: any): Promise<Advertisement>
    abstract update(advertisementId: string, accountId: string, update: any): Promise<Advertisement>
    abstract findOneById(id: string): Promise<Advertisement>
    abstract findForBulk(accountId: string, lastUpdatedAt: Date): Promise<any[]>
    abstract findByAccountIdWithEvents(accountId: string, page: number, limit: number): Promise<Advertisement[]>
    abstract findOneActive(advertisementId: string): Promise<Advertisement>
    abstract findToApprove(): Promise<Advertisement[]>
    abstract updateStatus(ids: string[], accountId: string, status: AdvertisementStatus, publishedAt: Date, approvingUserId: string): Promise<any>
    abstract updatePhotos(accountId: string, advertisementId: string, newPhotos: AdvertisementPhoto[], status: AdvertisementStatus): Promise<Advertisement>
    abstract findByIdsAndAccountId(ids: string[], accountId: string): Promise<Advertisement[]>
    abstract deleteMany(ids: string[], accountId: string): Promise<void>
    abstract getRegisteredAdvertisements(period: 'week' | 'month'): Promise<any[]>
    abstract findSimilarDocuments(embedding: number[]): Promise<any[]>
    abstract findWithReports(): Promise<Advertisement[]>
}