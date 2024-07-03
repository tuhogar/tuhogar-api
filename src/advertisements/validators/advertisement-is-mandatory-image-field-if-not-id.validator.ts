import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { AdvertisementType } from '../interfaces/advertisement.interface';

@ValidatorConstraint({ async: false })
export class AdvertisementIsMandatoryImageFieldIfNotConstraint implements ValidatorConstraintInterface {
    validate(field: any, args: ValidationArguments) {
        const object = args.object as any;

        const id = object.id;

        if (!id) {
            return !!field;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return `invalid.${args.property}.is.required`;
    }
}

export function AdvertisementIsMandatoryImageFieldIfNotId(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: AdvertisementIsMandatoryImageFieldIfNotConstraint,
        });
    };
}
