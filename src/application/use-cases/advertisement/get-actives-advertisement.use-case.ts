import { Injectable } from '@nestjs/common';
import { Advertisement, AdvertisementActivesOrderBy } from 'src/domain/entities/advertisement.interface';
import { AlgoliaService } from 'src/infraestructure/algolia/algolia.service';
import { GetActivesAdvertisementDto } from 'src/infraestructure/http/dtos/advertisement/get-actives-advertisement.dto';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';

@Injectable()
export class GetActivesAdvertisementUseCase {
    constructor(
        private readonly algoliaService: AlgoliaService,
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    async execute(getActivesAdvertisementDto: GetActivesAdvertisementDto): Promise<{ data: Advertisement[], count: number }> {
        const { data: advertisementIds, count } = await this.algoliaService.get(getActivesAdvertisementDto);
        if (!advertisementIds.length) throw Error('notfound.advertisements');

        let orderBy = undefined;
        switch (getActivesAdvertisementDto.orderBy) {
            case AdvertisementActivesOrderBy.HIGHEST_PRICE:
                orderBy = { price: -1 };
                break;
            case AdvertisementActivesOrderBy.LOWEST_PRICE:
                orderBy = { price: 1 };
                break;
            case AdvertisementActivesOrderBy.HIGHEST_PRICE_M2:
                orderBy = { pricePerFloorArea: -1 };
                break;
            case AdvertisementActivesOrderBy.LOWEST_PRICE_M2:
                orderBy = { pricePerFloorArea: 1 };
                break;
            default:
                break;
        }

        const advertisements = await this.advertisementRepository.findForActives(advertisementIds, orderBy);

        if (!orderBy) advertisements.sort(() => Math.random() - 0.5);

        return { data: advertisements, count };
    }
}