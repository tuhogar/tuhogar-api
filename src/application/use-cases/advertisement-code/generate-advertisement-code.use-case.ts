import { Injectable } from '@nestjs/common';
import { IAdvertisementCodeRepository } from 'src/application/interfaces/repositories/advertisement-code.repository.interface';

@Injectable()
export class GenerateAdvertisementCodeUseCase {
    constructor(
        private readonly advertisementCodeRepository: IAdvertisementCodeRepository,
    ) {
    }

    async execute(): Promise<number> {
        return this.advertisementCodeRepository.generate();
    }
}