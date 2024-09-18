import { Injectable } from '@nestjs/common';
import { IAdvertisementCodeRepository } from 'src/application/interfaces/repositories/advertisement-code.repository.interface';
import { AdvertisementCode } from 'src/domain/entities/advertisement-code';

@Injectable()
export class GenerateAdvertisementCodeUseCase {
    constructor(
        private readonly advertisementCodeRepository: IAdvertisementCodeRepository,
    ) {
    }

    async execute(): Promise<AdvertisementCode> {
        const response = await this.advertisementCodeRepository.findOneAndUpdate();
        return response;
    }
}