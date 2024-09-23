import { Injectable } from '@nestjs/common';
import { IAdvertisementReasonRepository } from 'src/application/interfaces/repositories/advertisement-reason.repository.interface';
import { AdvertisementReason } from 'src/domain/entities/advertisement-reason';

interface CreateAdvertisementReasonUseCaseCommand {
    name: string,
}

@Injectable()
export class CreateAdvertisementReasonUseCase {
    constructor(
        private readonly advertisementReasonRepository: IAdvertisementReasonRepository,
    ) {}

    async execute({ name }: CreateAdvertisementReasonUseCaseCommand): Promise<AdvertisementReason> {
        const advertisementReason = new AdvertisementReason({
            name,
        });

        const response = await this.advertisementReasonRepository.create(advertisementReason);
        return response;
    }   
}