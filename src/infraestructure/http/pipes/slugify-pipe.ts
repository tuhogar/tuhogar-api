import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import slugify from 'slugify';
import { plainToInstance } from 'class-transformer';
import { CreateUpdateAdvertisementDto } from '../dtos/advertisement/create-update-advertisement.dto';

@Injectable()
export class SlugifyPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'object' && value !== null) {
      if (value.address) {
        const adjustedState = value.address.state?.replace(/,|\.|D\.C\./g, '').trim();
        const adjustedCity = value.address.city?.replace(/,|\.|D\.C\./g, '').trim();
        const adjustedNeighbourhood = value.address.neighbourhood
          ? value.address.neighbourhood
              .replace(/^\s*barrio[:\-]?\s+/i, '') // remove prefixo "Barrio" no início
              .replace(/,|\.|D\.C\./g, '')
              .trim()
          : undefined;
        const adjustedSector = value.address.sector?.replace(/,|\.|D\.C\./g, '').trim();

        value.address.stateSlug = adjustedState ? slugify(adjustedState, { lower: true, strict: true }) : undefined;
        value.address.citySlug = adjustedCity ? slugify(adjustedCity, { lower: true, strict: true }) : undefined;
        value.address.neighbourhoodSlug = adjustedNeighbourhood ? slugify(adjustedNeighbourhood, { lower: true, strict: true }) : undefined;
        value.address.sectorSlug = adjustedSector ? slugify(adjustedSector, { lower: true, strict: true }) : undefined;
      }
    }
    return plainToInstance(CreateUpdateAdvertisementDto, value);
  }
}
