import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import slugify from 'slugify';
import { plainToInstance } from 'class-transformer';
import { CreateUpdateAdvertisementDto } from '../dtos/advertisement/create-update-advertisement.dto';

@Injectable()
export class SlugifyPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'object' && value !== null) {
      if (value.address) {
        value.address.stateSlug = slugify(value.address.state, { lower: true, strict: true });
        value.address.citySlug = slugify(value.address.city, { lower: true, strict: true });
        value.address.neighbourhoodSlug = slugify(value.address.neighbourhood, { lower: true, strict: true });
      }
    }
    return plainToInstance(CreateUpdateAdvertisementDto, value);
  }
}
