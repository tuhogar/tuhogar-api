import { Injectable } from '@nestjs/common';
import { IAdvertisementCodeRepository } from 'src/application/interfaces/repositories/advertisement-code.repository.interface';

@Injectable()
export class AdvertisementCodeService {
    constructor(
        private readonly advertisementCodeRepository: IAdvertisementCodeRepository,
    ) {
    }

    async generate(): Promise<number> {
        return this.advertisementCodeRepository.generate();
    }
}