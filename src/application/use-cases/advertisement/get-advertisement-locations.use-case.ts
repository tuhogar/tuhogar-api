import { Injectable } from '@nestjs/common';
import { AlgoliaService } from 'src/infraestructure/algolia/algolia.service';

interface GetAdvertisementLocationsUseCaseCommand {
    query: string
}

@Injectable()
export class GetAdvertisementLocationsUseCase {
    constructor(
        private readonly algoliaService: AlgoliaService,
    ) {}

    async execute(getAdvertisementLocationsUseCaseCommand: GetAdvertisementLocationsUseCaseCommand): Promise<any> {
        return this.algoliaService.getLocations(getAdvertisementLocationsUseCaseCommand.query);
    }
}