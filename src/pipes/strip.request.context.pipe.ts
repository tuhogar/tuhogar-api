import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { CreateUpdateAdvertisementDto } from 'src/advertisements/dtos/create-update-advertisement.dto';
import { CreateAccountDto } from 'src/accounts/dtos/create-account.dto';
import { getProperties } from 'src/decorators/property.decorator';
import { UpdateStatusAccountDto } from 'src/accounts/dtos/update-status-account.dto';
import { CreateUpdateAdvertisementReasonDto } from 'src/advertisement-reasons/dtos/create-update-advertisement-reason.dto';
import { CreateAdvertisementReportDto } from 'src/advertisement-reports/dtos/create-advertisement-report.dto';
import { UpdateStatusAdvertisementDto } from 'src/advertisements/dtos/update-status-advertisement.dto';
import { CreatePlanDto } from 'src/plans/dtos/create-plan.dto';
import { PatchUserDto } from 'src/users/dtos/patch-user.dto';
import { AddressDto } from 'src/addresses/dtos/address.dto';
import { SocialMediaDto } from 'src/users/dtos/create-social-media.dto';

const DtoMap = new Map<string, any>([
  ['CreateUpdateAdvertisementDto', CreateUpdateAdvertisementDto],
  ['CreateAccountDto', CreateAccountDto],
  ['UpdateStatusAccountDto', UpdateStatusAccountDto],
  ['CreateUpdateAdvertisementReasonDto', CreateUpdateAdvertisementReasonDto],
  ['CreateAdvertisementReportDto', CreateAdvertisementReportDto],
  ['UpdateStatusAdvertisementDto', UpdateStatusAdvertisementDto],
  ['CreatePlanDto', CreatePlanDto],
  ['PatchUserDto', PatchUserDto],
  ['address', AddressDto],
  ['socialMedia', SocialMediaDto],
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
    allowedProperties.forEach((a) => {
      if (DtoMap.has(a)) {
        const allowedProperties = getProperties(DtoMap.get(a));
        cleanObject(value[a], allowedProperties);
      }
    });
    cleanObject(value, allowedProperties);

    return value;
}

}