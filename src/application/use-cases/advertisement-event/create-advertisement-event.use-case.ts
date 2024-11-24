import { Injectable } from '@nestjs/common';
import { IAdvertisementEventRepository } from 'src/application/interfaces/repositories/advertisement-event.repository.interface';
import { AdvertisementEvent } from 'src/domain/entities/advertisement-event';

interface CreateAdvertisementEventUseCaseCommand {
    advertisementId: string,
    type: string,
}

@Injectable()
export class CreateAdvertisementEventUseCase {
    constructor(
        private readonly advertisementEventRepository: IAdvertisementEventRepository,
    ) {}

    async execute(
        { advertisementId, type }: CreateAdvertisementEventUseCaseCommand,
    ): Promise<AdvertisementEvent> {
        const exists = await this.advertisementEventRepository.findOneByAdvertisementIdAndType(advertisementId, type);
        if(exists) {
            return this.advertisementEventRepository.update(exists.id, exists.count + 1);
        }

        const advertisementEvent = new AdvertisementEvent({
            advertisementId,
            type,
            count: 1
        })

        const response = await this.advertisementEventRepository.create(advertisementEvent);
        return response;
    }
}