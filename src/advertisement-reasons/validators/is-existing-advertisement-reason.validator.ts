import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdvertisementReason } from '../interfaces/advertisement-reasons.interface';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsExistingAdvertisementReasonConstraint implements ValidatorConstraintInterface {
  constructor(@InjectModel('AdvertisementReason') private readonly planModel: Model<AdvertisementReason>) {}

  async validate(advertisementReasonId: string): Promise<boolean> {
    const advertisementReason = await this.planModel.findById(advertisementReasonId).exec();
    return !!advertisementReason;
  }

  defaultMessage(args: ValidationArguments): string {
    const object = args.object as any;
    return `invalid.advertisement.reason.${object.advertisementReasonId}.does.not.exist`;
  }
}

export function IsExistingAdvertisementReason(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsExistingAdvertisementReasonConstraint,
    });
  };
}
