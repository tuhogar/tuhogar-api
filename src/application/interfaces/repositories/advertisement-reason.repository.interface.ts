import { AdvertisementReason } from "src/domain/entities/advertisement-reason.interface";
import { CreateUpdateAdvertisementReasonDto } from "src/infraestructure/http/dtos/advertisement-reason/create-update-advertisement-reason.dto";

export abstract class IAdvertisementReasonRepository {
    abstract find(): Promise<AdvertisementReason[]>
    abstract create(createUpdateAdvertisementReasonDto: CreateUpdateAdvertisementReasonDto): Promise<void>
    abstract deleteOne(advertisementReasonId: string): Promise<void>
    abstract findOneAndUpdate(advertisementReasonId: string, createUpdateAdvertisementReasonDto: CreateUpdateAdvertisementReasonDto ): Promise<{ id: string }>
    abstract findById(advertisementReasonId: string): Promise<AdvertisementReason>
}