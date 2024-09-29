import { Injectable } from '@nestjs/common';
import { IAdvertisementReasonRepository } from 'src/application/interfaces/repositories/advertisement-reason.repository.interface';
import { AdvertisementReason } from 'src/domain/entities/advertisement-reason';

@Injectable()
export class GetAllAdvertisementReasonUseCase {
    constructor(
        private readonly advertisementReasonRepository: IAdvertisementReasonRepository,
    ) {}

    async execute(): Promise<AdvertisementReason[]> {
        const response = await this.advertisementReasonRepository.find();
        return response;
    }   
}