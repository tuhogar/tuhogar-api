import { Advertisement, AdvertisementActivesOrderBy, AdvertisementPhoto } from "src/domain/entities/advertisement";
import { AuthenticatedUser } from "src/domain/entities/authenticated-user";
import { CreateUpdateAdvertisementDto } from "src/infraestructure/http/dtos/advertisement/create-update-advertisement.dto";
import { UpdateStatusAdvertisementDto } from "src/infraestructure/http/dtos/advertisement/update-status-advertisement.dto";
import { UpdateStatusAllAdvertisementsDto } from "src/infraestructure/http/dtos/advertisement/update-status-all-advertisement.dto";

export abstract class IAdvertisementRepository {
    abstract create(data: any): Promise<Advertisement>
    abstract findOne(advertisementId: string, accountId: string): Promise<Advertisement>
    abstract findOneAndUpdate(advertisementId: string, accountId: string, update: any): Promise<Advertisement>
    abstract findForBulk(accountId: string, lastUpdatedAt: Date): Promise<any[]>
    abstract findForActives(advertisementIds: string[], orderBy: AdvertisementActivesOrderBy): Promise<Advertisement[]>
    abstract getAllByAccountId(accountId: string): Promise<Advertisement[]>
    abstract getByAccountIdAndId(filter: any): Promise<Advertisement>
    abstract get(advertisementId: string): Promise<Advertisement>
    abstract getActive(advertisementId: string): Promise<Advertisement>
    abstract getAllToApprove(): Promise<Advertisement[]>
    abstract findForUpdateStatus(userId: string, filter: any, updateStatusAdvertisementDto: UpdateStatusAdvertisementDto, publishedAt: any, approvingUserId: any): Promise<Advertisement>
    abstract updateStatusAll(filter: any, update: any): Promise<any>
    abstract findById(advertisementId: string): Promise<Advertisement>
    abstract updateProcessPhotos(accountId: string, advertisementId: string, newPhotos: AdvertisementPhoto[]): Promise<Advertisement>
    abstract updateForDeletePhotos(accountId: string, advertisementId: string, newPhotos: AdvertisementPhoto[]): Promise<Advertisement>
    abstract find(filter: any): Promise<Advertisement[]>
    abstract deleteMany(filter: any): Promise<void>
    abstract getRegisteredAdvertisements(period: 'week' | 'month'): Promise<any[]>
    abstract findSimilarDocuments(embedding: number[]): Promise<any[]>
    abstract findAllWithReports(): Promise<Advertisement[]>
}