import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { AdvertisementType } from '../../../../domain/entities/advertisement';




@ValidatorConstraint({ async: false })
export class AdvertisementIsFloorsCountMandatoryConstraint implements ValidatorConstraintInterface {
    validate(floorsCount: any, args: ValidationArguments) {
        const object = args.object as any;
        const type = object.type;

        if (type === AdvertisementType.HOUSE || 
            type === AdvertisementType.APARTMENT ||
            type === AdvertisementType.OFFICE ||
            type === AdvertisementType.WAREHOUSE ||
            type === AdvertisementType.BUILDING ||
            type === AdvertisementType.COMMERCIAL) {
            return typeof floorsCount === 'number' && floorsCount > 0;
        }
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'invalid.floorsCount.must.be.a.number.greater.than.0.when.type.is.HOUSE.APARTMENT.OFFICE.WAREHOUSE.BUILDING.or.COMMERCIAL';
    }
}

export function AdvertisementIsFloorsCountMandatory(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: AdvertisementIsFloorsCountMandatoryConstraint,
        });
    };
}
