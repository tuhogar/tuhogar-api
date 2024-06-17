import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Amenity } from '../interfaces/amenities.interface';

@ValidatorConstraint({ async: true })
@Injectable()
export class AmenityIsExistingNameConstraint implements ValidatorConstraintInterface {
  constructor(@InjectModel('Amenity') private readonly amenityModel: Model<Amenity>) {}

  async validate(name: string): Promise<boolean> {
    if (!name) return false;
    const amenity = await this.amenityModel.findOne({ name }).exec();
    return !!amenity;
  }

  defaultMessage(args: ValidationArguments): string {
    const object = args.object as any;
    const data = object.name || object.amenities?.toString() || 'value';
    return `invalid.amenity.${data}.does.not.exist`;
  }
}

export function AmenityIsExistingName(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: AmenityIsExistingNameConstraint,
    });
  };
}
