import { AdvertisementReason } from "src/domain/entities/advertisement-reason.interface";
import { CreateUpdateAdvertisementReasonDto } from "src/infraestructure/http/dtos/advertisement-reason/create-update-advertisement-reason.dto";

export abstract class IAdvertisementReasonRepository {
    abstract getAll(): Promise<AdvertisementReason[]>
    abstract create(createUpdateAdvertisementReasonDto: CreateUpdateAdvertisementReasonDto): Promise<void>
    abstract delete(advertisementReasonId: string): Promise<void>
    abstract update(advertisementReasonId: string, createUpdateAdvertisementReasonDto: CreateUpdateAdvertisementReasonDto ): Promise<{ id: string }>
}