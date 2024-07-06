const algoliasearch = require('algoliasearch')
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdvertisementsService } from 'src/advertisements/advertisements.service';
import { GetActivesAdvertisementDto } from 'src/advertisements/dtos/get-actives-advertisement.dto';
import { Advertisement } from 'src/advertisements/interfaces/advertisement.interface';

@Injectable()
export class AlgoliaService {
    private client;
    private index;

    constructor(
        private configService: ConfigService,
      ) {
        this.client = algoliasearch(
            this.configService.get<string>('ALGOLIA_APP_ID'),
            this.configService.get<string>('ALGOLIA_API_KEY')
        );
        this.index = this.client.initIndex('advertisements');
      }

      async bulk(advertisements: Advertisement[]): Promise<void> {
        await Promise.all(advertisements.map(async(a: any) => {
            a.objectID = a._id;
            
            await this.index.saveObject(a).wait();
        }));
      }

      async delete(objectID: string): Promise<void> {
        await this.index.deleteObject(objectID);
      }

      async get(getActivesAdvertisementDto: GetActivesAdvertisementDto): Promise<string[]> {
        let filters: string[] = [];

        const addRangeFilter = (field: string, min?: number, max?: number) => {
          if (min > 0 || max > 0) {
            filters.push(`${field}:${min} TO ${max}`);
          }
        };

        const addMultiValueFilter = (field: string, values: string[] | undefined, clausule: string) => {
          if (values && values.length > 0) {
            const filter = values.map(value => `${field}:${value}`).join(` ${clausule} `);
            filters.push(`(${filter})`);
          }
        };

        if (getActivesAdvertisementDto.code) {
          filters.push(`code:${getActivesAdvertisementDto.code}`);
        } else {
          addMultiValueFilter('transactionType', getActivesAdvertisementDto.transactionType, 'OR');
          addMultiValueFilter('type', getActivesAdvertisementDto.type, 'OR');
          addMultiValueFilter('constructionType', getActivesAdvertisementDto.constructionType, 'OR');
          

          if (getActivesAdvertisementDto.allContentsIncluded !== undefined) filters.push(`allContentsIncluded:${getActivesAdvertisementDto.allContentsIncluded}`);
          if (getActivesAdvertisementDto.isResidentialComplex !== undefined) filters.push(`isResidentialComplex:${getActivesAdvertisementDto.isResidentialComplex}`);
          if (getActivesAdvertisementDto.isPenthouse !== undefined) filters.push(`isPenthouse:${getActivesAdvertisementDto.isPenthouse}`);
          if (getActivesAdvertisementDto.isHoaIncluded !== undefined) filters.push(`isHoaIncluded:${getActivesAdvertisementDto.isHoaIncluded}`);

          addMultiValueFilter('amenities.key', getActivesAdvertisementDto.amenity, 'AND');
    
          addRangeFilter('bedsCount', getActivesAdvertisementDto.bedsCountMin, getActivesAdvertisementDto.bedsCountMax);
          addRangeFilter('bathsCount', getActivesAdvertisementDto.bathsCountMin, getActivesAdvertisementDto.bathsCountMax);
          addRangeFilter('parkingCount', getActivesAdvertisementDto.parkingCountMin, getActivesAdvertisementDto.parkingCountMax);
          addRangeFilter('floorsCount', getActivesAdvertisementDto.floorsCountMin, getActivesAdvertisementDto.floorsCountMax);
          addRangeFilter('constructionYear', getActivesAdvertisementDto.constructionYearMin, getActivesAdvertisementDto.constructionYearMax);
          addRangeFilter('socioEconomicLevel', getActivesAdvertisementDto.socioEconomicLevelMin, getActivesAdvertisementDto.socioEconomicLevelMax);
          addRangeFilter('hoaFee', getActivesAdvertisementDto.hoaFeeMin, getActivesAdvertisementDto.hoaFeeMax);
          addRangeFilter('lotArea', getActivesAdvertisementDto.lotAreaMin, getActivesAdvertisementDto.lotAreaMax);
          addRangeFilter('floorArea', getActivesAdvertisementDto.floorAreaMin, getActivesAdvertisementDto.floorAreaMax);
          addRangeFilter('pricePerLotArea', getActivesAdvertisementDto.pricePerLotAreaMin, getActivesAdvertisementDto.pricePerLotAreaMax);
          addRangeFilter('pricePerFloorArea', getActivesAdvertisementDto.pricePerFloorAreaMin, getActivesAdvertisementDto.pricePerFloorAreaMax);
          addRangeFilter('propertyTax', getActivesAdvertisementDto.propertyTaxMin, getActivesAdvertisementDto.propertyTaxMax);
        }
        const filter = filters.join(' AND ');

        const searchText: string[] = [];
        const restrictSearchableAttributes: string[] = [];

        const addSearchText = (field: string, value: string | undefined) => {
          if (value) {
            searchText.push(value);
            restrictSearchableAttributes.push(`address.${field}`);
          }
        };
        
        addSearchText('country', getActivesAdvertisementDto.country);
        addSearchText('state', getActivesAdvertisementDto.state);
        addSearchText('city', getActivesAdvertisementDto.city);
        addSearchText('neighbourhood', getActivesAdvertisementDto.neighbourhood);
        addSearchText('street', getActivesAdvertisementDto.street);
        addSearchText('stateSlug', getActivesAdvertisementDto.stateSlug);
        addSearchText('citySlug', getActivesAdvertisementDto.citySlug);
        addSearchText('neighbourhoodSlug', getActivesAdvertisementDto.neighbourhoodSlug);

        const query = searchText.join(' ');

        const { hits } = await this.index.search(query, {
          filters: filter,
          restrictSearchableAttributes: restrictSearchableAttributes.length > 0 ? restrictSearchableAttributes : undefined,
          attributesToRetrieve: [],
          attributesToHighlight: []
        });

        const objectIDs = hits.map((hit: any) => hit.objectID);

        return objectIDs;
      }
}
