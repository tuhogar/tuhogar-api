const algoliasearch = require('algoliasearch')
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetActivesAdvertisementDto } from 'src/infraestructure/http/dtos/advertisement/get-actives-advertisement.dto';
import { Advertisement, AdvertisementActivesOrderBy } from 'src/domain/entities/advertisement';

enum AlgoliaIndexes {
  ADVERTISEMENTS = 'advertisements',
  ADVERTISEMENTS_UPDATED_AT_DESC = '_updatedAt_desc',
  ADVERTISEMENTS_PRICE_ASC = '_price_asc',
  ADVERTISEMENTS_PRICE_DESC = '_price_desc',
  ADVERTISEMENTS_PRICE_PER_FLOOR_AREA_ASC = '_pricePerFloorArea_asc',
  ADVERTISEMENTS_PRICE_PER_FLOOR_AREA_DESC = '_pricePerFloorArea_desc',
}

@Injectable()
export class AlgoliaService {
    private readonly client;
    private readonly index;
    private readonly indexName: string;

    constructor(
      private readonly configService: ConfigService,
      ) {
        this.client = algoliasearch(
            this.configService.get<string>('ALGOLIA_APP_ID'),
            this.configService.get<string>('ALGOLIA_API_KEY')
        );

        this.indexName = `${AlgoliaIndexes.ADVERTISEMENTS}${this.configService.get<string>('ENVIRONMENT') === 'PRODUCTION' ? '_prod' : ''}`
        this.index = this.client.initIndex(this.indexName);
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

      async get(getActivesAdvertisementDto: GetActivesAdvertisementDto): Promise<{ data: string[], count: number }> {
        let filters: string[] = [];

        const addRangeFilter = (field: string, min?: number, max?: number) => {
          if (min > 0 && max > 0) {
            filters.push(`${field}:${min} TO ${max}`);
          } else if (min > 0) {
            filters.push(`${field} >= ${min}`);
          } else if (max > 0) {
            filters.push(`${field} <= ${max}`);
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
          

          if (getActivesAdvertisementDto.accountId !== undefined) filters.push(`accountId:${getActivesAdvertisementDto.accountId}`);
          if (getActivesAdvertisementDto.allContentsIncluded !== undefined) filters.push(`allContentsIncluded:${getActivesAdvertisementDto.allContentsIncluded}`);
          if (getActivesAdvertisementDto.isResidentialComplex !== undefined) filters.push(`isResidentialComplex:${getActivesAdvertisementDto.isResidentialComplex}`);
          if (getActivesAdvertisementDto.isPenthouse !== undefined) filters.push(`isPenthouse:${getActivesAdvertisementDto.isPenthouse}`);
          if (getActivesAdvertisementDto.isHoaIncluded !== undefined) filters.push(`isHoaIncluded:${getActivesAdvertisementDto.isHoaIncluded}`);

          addMultiValueFilter('amenities', getActivesAdvertisementDto.amenity, 'AND');
          addMultiValueFilter('communityAmenities', getActivesAdvertisementDto.communityAmenity, 'AND');
          addMultiValueFilter('contractTypes', getActivesAdvertisementDto.contractType, 'AND');

          addRangeFilter('bedsCount', getActivesAdvertisementDto.bedsCountMin, getActivesAdvertisementDto.bedsCountMax);
          addRangeFilter('bathsCount', getActivesAdvertisementDto.bathsCountMin, getActivesAdvertisementDto.bathsCountMax);
          addRangeFilter('parkingCount', getActivesAdvertisementDto.parkingCountMin, getActivesAdvertisementDto.parkingCountMax);
          addRangeFilter('floorsCount', getActivesAdvertisementDto.floorsCountMin, getActivesAdvertisementDto.floorsCountMax);
          addRangeFilter('constructionYear', getActivesAdvertisementDto.constructionYearMin, getActivesAdvertisementDto.constructionYearMax);
          addRangeFilter('socioEconomicLevel', getActivesAdvertisementDto.socioEconomicLevelMin, getActivesAdvertisementDto.socioEconomicLevelMax);
          addRangeFilter('hoaFee', getActivesAdvertisementDto.hoaFeeMin, getActivesAdvertisementDto.hoaFeeMax);
          addRangeFilter('lotArea', getActivesAdvertisementDto.lotAreaMin, getActivesAdvertisementDto.lotAreaMax);
          addRangeFilter('floorArea', getActivesAdvertisementDto.floorAreaMin, getActivesAdvertisementDto.floorAreaMax);
          addRangeFilter('price', getActivesAdvertisementDto.priceMin, getActivesAdvertisementDto.priceMax);
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
        addSearchText('postalCode', getActivesAdvertisementDto.postalCode);
        addSearchText('placeId', getActivesAdvertisementDto.placeId);
        addSearchText('establishment', getActivesAdvertisementDto.establishment);

        const query = searchText.join(' ');

        const options: any = {
          filters: filter,
          restrictSearchableAttributes: restrictSearchableAttributes.length > 0 ? restrictSearchableAttributes : undefined,
          attributesToRetrieve: [],
          attributesToHighlight: [],
        };

        if (getActivesAdvertisementDto.latitude && getActivesAdvertisementDto.longitude && getActivesAdvertisementDto.radius) {
          options.aroundLatLng = `${getActivesAdvertisementDto.latitude},${getActivesAdvertisementDto.longitude}`;
          options.aroundRadius = getActivesAdvertisementDto.radius * 1000;
        }

        if (getActivesAdvertisementDto.page) options['page'] = getActivesAdvertisementDto.page - 1;
        if (getActivesAdvertisementDto.limit) options['hitsPerPage'] = getActivesAdvertisementDto.limit;

        // Apesar de termos o indice padrão,
        // Foi adicionado no switch e no if abaixo o AlgoliaIndexes.ADVERTISEMENTS_UPDATED_AT_DESC como padrão
        let selectedIndex = this.index; // Índice padrão

        // Verifica o campo de ordenação e altera o índice conforme necessário
        if (getActivesAdvertisementDto.orderBy) {
          switch (getActivesAdvertisementDto.orderBy) {
            case AdvertisementActivesOrderBy.LOWEST_PRICE:
              selectedIndex = this.client.initIndex(`${this.indexName}${AlgoliaIndexes.ADVERTISEMENTS_PRICE_ASC}`);
              break;
            case AdvertisementActivesOrderBy.HIGHEST_PRICE:
              selectedIndex = this.client.initIndex(`${this.indexName}${AlgoliaIndexes.ADVERTISEMENTS_PRICE_DESC}`);
              break;
            case AdvertisementActivesOrderBy.LOWEST_PRICE_M2:
              selectedIndex = this.client.initIndex(`${this.indexName}${AlgoliaIndexes.ADVERTISEMENTS_PRICE_PER_FLOOR_AREA_ASC}`);
              break;
            case AdvertisementActivesOrderBy.HIGHEST_PRICE_M2:
              selectedIndex = this.client.initIndex(`${this.indexName}${AlgoliaIndexes.ADVERTISEMENTS_PRICE_PER_FLOOR_AREA_DESC}`);
              break;
            default:
              selectedIndex = this.client.initIndex(`${this.indexName}${AlgoliaIndexes.ADVERTISEMENTS_UPDATED_AT_DESC}`);
              break;
          }
        } else {
          selectedIndex = this.client.initIndex(`${this.indexName}${AlgoliaIndexes.ADVERTISEMENTS_UPDATED_AT_DESC}`);
        }

        console.time('----algolia');
        const { hits, nbHits: count } = await selectedIndex.search(query, options);
        console.timeEnd('----algolia');

        const objectIDs = hits.map((hit: any) => hit.objectID);

        return { data: objectIDs, count };
      }

      async getLocations(query: string): Promise<any> {
        const normalizedQuery = this.normalizeString(query);


        let page = 0;
        let hits = [];
        let hasMoreResults = true;
        
        while (hasMoreResults) {
            const result = await this.index.search(normalizedQuery, {
                hitsPerPage: 1000,
                page: page,
            });
        
            hits = hits.concat(result.hits);
        
            if (result.hits.length < 1000) {
                hasMoreResults = false;
            }
        
            page++;
        }

        const states = new Map<string, { state: string; stateSlug: string }>();
        const cities = new Map<string, { state: string; stateSlug: string; city: string; citySlug: string }>();
        const neighbourhoods = new Map<string, any>();
    
        hits.forEach((hit: any) => {
            const { state, city, neighbourhood, stateSlug, citySlug, neighbourhoodSlug } = hit.address;
            
            const stateObj = { state, stateSlug };
            const cityObj = { state, stateSlug, city, citySlug };
            const neighbourhoodObj = { state, stateSlug, city, citySlug, neighbourhood, neighbourhoodSlug };
    
            const normalizedState = this.normalizeString(state);
            const normalizedCity = this.normalizeString(city);
            const normalizedNeighbourhood = this.normalizeString(neighbourhood);
    
            // Se o estado corresponder à consulta, adicione-o e todas as cidades e bairros desse estado
            if (normalizedState.includes(normalizedQuery)) {
                if (!states.has(stateSlug)) {
                    states.set(stateSlug, stateObj);
                }
    
                // Adicionar todas as cidades relacionadas ao estado
                if (!cities.has(citySlug)) {
                    cities.set(citySlug, cityObj);
                }
    
                // Adicionar todos os bairros das cidades do estado
                if (!neighbourhoods.has(neighbourhoodSlug)) {
                    neighbourhoods.set(neighbourhoodSlug, neighbourhoodObj);
                }
            }
    
            // Se a cidade corresponder à consulta, adicione-a e todos os bairros dessa cidade
            if (normalizedCity.includes(normalizedQuery)) {
                if (!cities.has(citySlug)) {
                    cities.set(citySlug, cityObj);
                }
    
                // Adicionar todos os bairros dessa cidade
                if (!neighbourhoods.has(neighbourhoodSlug)) {
                    neighbourhoods.set(neighbourhoodSlug, neighbourhoodObj);
                }
    
                // Adicionar estado relacionado à cidade, se não estiver já adicionado
                if (!states.has(stateSlug)) {
                    states.set(stateSlug, stateObj);
                }
            }
    
            // Se o bairro corresponder à consulta, adicione-o e todas as cidades e estados dessa cidade
            if (normalizedNeighbourhood.includes(normalizedQuery)) {
                if (!neighbourhoods.has(neighbourhoodSlug)) {
                    neighbourhoods.set(neighbourhoodSlug, neighbourhoodObj);
                }
    
                // Adicionar cidade relacionada ao bairro
                if (!cities.has(citySlug)) {
                    cities.set(citySlug, cityObj);
                }
    
                // Adicionar estado relacionado ao bairro
                if (!states.has(stateSlug)) {
                    states.set(stateSlug, stateObj);
                }
            }
        });
    
        return {
            state: {
                count: states.size,
                result: Array.from(states.values()),
            },
            city: {
                count: cities.size,
                result: Array.from(cities.values()),
            },
            neighbourhood: {
                count: neighbourhoods.size,
                result: Array.from(neighbourhoods.values()),
            },
        };
    }
    
    private normalizeString(str: string): string {
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
    }
    
      
}