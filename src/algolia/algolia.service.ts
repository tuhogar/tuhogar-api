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

      async get(getActivesAdvertisementDto: GetActivesAdvertisementDto): Promise<string[]> {
        console.log('------getActivesAdvertisementDto');
        console.log(getActivesAdvertisementDto);
        console.log('------getActivesAdvertisementDto');

        let filters = '';
        if (getActivesAdvertisementDto.code) {
          filters += `code:${getActivesAdvertisementDto.code} `;
        } else {
          //if (getActivesAdvertisementDto.transactionTypes) {
          //  filters += `transactionTypes:${getActivesAdvertisementDto.description}`
          //}
        }

        console.log('------filters');
        console.log(filters);
        console.log('------filters');



        const { hits } = await this.index.search('', {
            filters,
            attributesToRetrieve: [],
            attributesToHighlight: []
        });

        const objectIDs = hits.map((hit: any) => hit.objectID);

        console.log('----objectIDs');
        console.log(objectIDs);
        console.log('----objectIDs');

        return objectIDs;
      }
}
