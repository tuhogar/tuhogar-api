import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CreateUpdateAdvertisementDto } from 'src/infraestructure/http/dtos/advertisement/create-update-advertisement.dto';
import { CreateAccountDto } from '../dtos/account/create-account.dto';
import { getProperties } from '../../decorators/property.decorator';
import { UpdateStatusAccountDto } from 'src/infraestructure/http/dtos/account/update-status-account.dto';
import { CreateUpdateAdvertisementReasonDto } from '../dtos/advertisement-reason/create-update-advertisement-reason.dto';
import { CreateAdvertisementReportDto } from 'src/infraestructure/http/dtos/advertisement-report/create-advertisement-report.dto';
import { UpdateStatusAdvertisementDto } from 'src/infraestructure/http/dtos/advertisement/update-status-advertisement.dto';
import { CreatePlanDto } from 'src/infraestructure/http/dtos/plan/create-plan.dto';
import { PatchUserDto } from 'src/infraestructure/http/dtos/user/patch-user.dto';
import { AddressDto } from 'src/infraestructure/http/dtos/address/address.dto';
import { SocialMediaDto } from 'src/infraestructure/http/dtos/social-media/create-social-media.dto';
import { CreateFavoriteAdvertisementDto } from 'src/infraestructure/http/dtos/user/create-favorite-advertisement.dto';
import { PatchAccountDto } from '../dtos/account/patch-account.dto';

const DtoMap = new Map<string, any>([
  ['CreateUpdateAdvertisementDto', CreateUpdateAdvertisementDto],
  ['CreateAccountDto', CreateAccountDto],
  ['UpdateStatusAccountDto', UpdateStatusAccountDto],
  ['CreateUpdateAdvertisementReasonDto', CreateUpdateAdvertisementReasonDto],
  ['CreateAdvertisementReportDto', CreateAdvertisementReportDto],
  ['UpdateStatusAdvertisementDto', UpdateStatusAdvertisementDto],
  ['CreatePlanDto', CreatePlanDto],
  ['PatchUserDto', PatchUserDto],
  ['PatchAccountDto', PatchAccountDto],
  ['address', AddressDto],
  ['socialMedia', SocialMediaDto],
  ['CreateFavoriteAdvertisementDto', CreateFavoriteAdvertisementDto],
]);

function cleanObject(obj, allowedProps) {
  Object.keys(obj).forEach(key => {
    if (!allowedProps.includes(key)) {
      delete obj[key];
    }
  });
}

@Injectable()
export class StripRequestContextPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    if (!metatype || !DtoMap.has(metatype.name)) {
      return value;
    }

    const allowedProperties = getProperties(DtoMap.get(metatype.name));
    if (!allowedProperties) return value;

    allowedProperties.forEach((a) => {
      if (DtoMap.has(a)) {
        const allowedProperties = getProperties(DtoMap.get(a));
        if (value[a]) cleanObject(value[a], allowedProperties);
      }
    });
    cleanObject(value, allowedProperties);

    return value;
}

}