import { Injectable } from '@nestjs/common';
import { OpenAiService } from 'src/infraestructure/open-ai/open-ai.service';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';

@Injectable()
export class FindSimilarDocumentsAdvertisementUseCase {
    constructor(
        private readonly openAiService: OpenAiService,
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    async execute(query: string) {
        const embedding = await this.openAiService.getEmbedding(query);
    
        return this.advertisementRepository.findSimilarDocuments(embedding);
    }
}