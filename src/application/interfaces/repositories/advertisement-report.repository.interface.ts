import { AdvertisementReport } from "src/domain/entities/advertisement-report.interface";
import { CreateAdvertisementReportDto } from "src/infraestructure/http/dtos/advertisement-report/create-advertisement-report.dto";

export abstract class IAdvertisementReportRepository {
    abstract find(advertisementId: string): Promise<AdvertisementReport[]>
    abstract create(createAdvertisementReportDto: CreateAdvertisementReportDto): Promise<{ id: string }>
    abstract deleteOne(advertisementReportId: string): Promise<void>
}