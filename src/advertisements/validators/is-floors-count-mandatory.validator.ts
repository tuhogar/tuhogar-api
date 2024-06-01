import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { AdvertisementPropertyStatus } from '../interfaces/advertisement.interface';




@ValidatorConstraint({ async: false })
export class IsFloorsCountMandatoryConstraint implements ValidatorConstraintInterface {
    validate(floorsCount: any, args: ValidationArguments) {
        const object = args.object as any;
        const propertyStatus = object.propertyStatus;

        if (propertyStatus === AdvertisementPropertyStatus.HOUSE || 
            propertyStatus === AdvertisementPropertyStatus.APARTMENT ||
            propertyStatus === AdvertisementPropertyStatus.OFFICE ||
            propertyStatus === AdvertisementPropertyStatus.WAREHOUSE ||
            propertyStatus === AdvertisementPropertyStatus.BUILDING ||
            propertyStatus === AdvertisementPropertyStatus.COMMERCIAL) {
            return typeof floorsCount === 'number' && floorsCount > 0;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'floorsCount must be a number greater than 0 when propertyStatus is HOUSE, APARTMENT, OFFICE, WAREHOUSE, BUILDING or COMMERCIAL';
    }
}

export function IsFloorsCountMandatory(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsFloorsCountMandatoryConstraint,
        });
    };
}
