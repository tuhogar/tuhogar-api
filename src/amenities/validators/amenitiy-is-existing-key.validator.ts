import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Amenity } from '../interfaces/amenities.interface';

@ValidatorConstraint({ async: true })
@Injectable()
export class AmenityIsExistingKeyConstraint implements ValidatorConstraintInterface {
  constructor(@InjectModel('Amenity') private readonly amenityModel: Model<Amenity>) {}

  async validate(key: string): Promise<boolean> {
    if (!key) return false;
    const amenity = await this.amenityModel.findOne({ key }).exec();
    return !!amenity;
  }

  defaultMessage(args: ValidationArguments): string {
    const object = args.object as any;
    const data = object.key || object.amenities?.toString() || 'value';
    return `invalid.amenity.${data}.does.not.exist`;
  }
}

export function AmenityIsExistingKey(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: AmenityIsExistingKeyConstraint,
    });
  };
}
