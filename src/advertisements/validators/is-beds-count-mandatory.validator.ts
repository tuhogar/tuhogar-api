import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { AdvertisementPropertyStatus } from '../interfaces/advertisement.interface';




@ValidatorConstraint({ async: false })
export class IsBedsCountMandatoryConstraint implements ValidatorConstraintInterface {
    validate(bedsCount: any, args: ValidationArguments) {
        const object = args.object as any;
        const propertyStatus = object.propertyStatus;

        if (propertyStatus === AdvertisementPropertyStatus.HOUSE || propertyStatus === AdvertisementPropertyStatus.APARTMENT) {
            return typeof bedsCount === 'number' && bedsCount > 0;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'bedsCount must be a number greater than 0 when propertyStatus is HOUSE or APARTMENT';
    }
}

export function IsBedsCountMandatory(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsBedsCountMandatoryConstraint,
        });
    };
}
