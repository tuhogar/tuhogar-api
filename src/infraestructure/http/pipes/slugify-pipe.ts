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

        value.address.stateSlug = adjustedState ? slugify(adjustedState, { lower: true, strict: true }) : undefined;
        value.address.citySlug = adjustedCity ? slugify(adjustedCity, { lower: true, strict: true }) : undefined;
        value.address.neighbourhoodSlug = slugify(value.address.neighbourhood, { lower: true, strict: true });
      }
    }
    return plainToInstance(CreateUpdateAdvertisementDto, value);
  }
}
