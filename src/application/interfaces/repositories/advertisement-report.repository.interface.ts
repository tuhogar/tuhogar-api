import { AdvertisementReport } from "src/domain/entities/advertisement-report";

export abstract class IAdvertisementReportRepository {
    abstract findByAdvertisementId(advertisementId: string): Promise<AdvertisementReport[]>
    abstract create(advertisementReport: AdvertisementReport): Promise<AdvertisementReport>
    abstract delete(id: string): Promise<void>
}