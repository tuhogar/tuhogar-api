import { AdvertisementEvent } from "src/domain/entities/advertisement-event";

export abstract class IAdvertisementEventRepository {
    abstract findOneByAdvertisementIdAndType(advertisementId: string, type: string): Promise<AdvertisementEvent>
    abstract create(advertisementEvent: AdvertisementEvent): Promise<AdvertisementEvent>
    abstract update(id: string, count: number): Promise<AdvertisementEvent>
}