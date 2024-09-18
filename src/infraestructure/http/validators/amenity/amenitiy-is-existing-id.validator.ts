import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { IAmenityRepository } from 'src/application/interfaces/repositories/amenity.repository.interface';
import { GetByIdAmenityUseCase } from 'src/application/use-cases/amenity/get-by-id-amenity.use-case';

@ValidatorConstraint({ async: true })
@Injectable()
export class AmenityIsExistingIdConstraint implements ValidatorConstraintInterface {
  constructor(private readonly getByIdAmenityUseCase: GetByIdAmenityUseCase) {}

  async validate(id: string): Promise<boolean> {
    if (!id) return false;
    const amenity = await this.getByIdAmenityUseCase.execute({ id });
    return !!amenity;
  }

  defaultMessage(args: ValidationArguments): string {
    const object = args.object as any;
    const data = object.id || object.amenities?.toString() || 'value';
    return `invalid.amenity.${data}.does.not.exist`;
  }
}

export function AmenityIsExistingId(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: AmenityIsExistingIdConstraint,
    });
  };
}
