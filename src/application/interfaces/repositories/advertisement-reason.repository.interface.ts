import { AdvertisementReason } from "src/domain/entities/advertisement-reason";

export abstract class IAdvertisementReasonRepository {
    abstract find(): Promise<AdvertisementReason[]>
    abstract create(advertisementReason: AdvertisementReason): Promise<AdvertisementReason>
    abstract delete(id: string): Promise<void>
    abstract update(id: string, advertisementReason: AdvertisementReason): Promise<AdvertisementReason>
    abstract findOneById(id: string): Promise<AdvertisementReason>
}