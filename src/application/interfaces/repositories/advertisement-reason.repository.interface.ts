import { AdvertisementReason } from "src/domain/entities/advertisement-reason";

export abstract class IAdvertisementReasonRepository {
    abstract find(): Promise<AdvertisementReason[]>
    abstract create(advertisementReason: AdvertisementReason): Promise<AdvertisementReason>
    abstract deleteOne(id: string): Promise<void>
    abstract findOneAndUpdate(id: string, advertisementReason: AdvertisementReason): Promise<AdvertisementReason>
    abstract findById(id: string): Promise<AdvertisementReason>
}