import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Types } from 'mongoose';

@ValidatorConstraint({ async: false })
class IsObjectIdConstraint implements ValidatorConstraintInterface {
  validate(objectId: any) {
    return Types.ObjectId.isValid(objectId);
  }

  defaultMessage() {
    return 'Invalid MongoDB ObjectId';
  }
}

export function IsObjectId(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsObjectIdConstraint,
    });
  };
}
